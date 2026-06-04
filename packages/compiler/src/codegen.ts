import type {
  BotDecl,
  Expression,
  Handler,
  Program,
  Statement,
  TimerDecl
} from "./ast.js";
import { NewtError } from "./errors.js";

export interface GeneratedProject {
  botJs: string;
  packageJson: string;
}

export function generate(program: Program): GeneratedProject {
  const botName = getBotValue(program, "name") ?? "NewtBot";
  const prefix = getBotValue(program, "prefix") ?? "!";
  const tokenDecl = program.body.find((node): node is BotDecl => node.type === "BotDecl" && node.kind === "token");

  // Fix #15: Guard against missing DISCORD_TOKEN env var with a clear message.
  // Previously generated code silently passed undefined to client.login().
  const tokenExpr = tokenDecl?.fromEnv
    ? `(() => { const t = process.env.${tokenDecl.value.value}; if (!t) { console.error("Error: environment variable ${tokenDecl.value.value} is not set.\\nAdd it to your environment before running your bot."); process.exit(1); } return t; })()`
    : JSON.stringify(tokenDecl?.value.value ?? "");

  // Collect which handlers are present so we can emit only the imports we need
  const handlerTypes = new Set(
    program.body
      .filter((n): n is Handler | TimerDecl => n.type.endsWith("Handler") || n.type.endsWith("TimerDecl"))
      .map((n) => n.type)
  );

  const hasModals = handlerTypes.has("ModalSubmitHandler") ||
    program.body.some((n) => n.type.endsWith("Handler") && hasShowModal((n as Handler).body ?? []));

  const handlers = program.body
    .filter((node): node is Handler | TimerDecl => node.type.endsWith("Handler") || node.type.endsWith("TimerDecl"))
    .map((node) => emitTopLevel(node, prefix))
    .join("\n\n");

  // Fix #5: Build the discord.js import dynamically based on what the program actually uses,
  // so we never reference an unimported builder. Previously the import was hardcoded and
  // lacked ModalBuilder, TextInputBuilder, TextInputStyle, etc. needed for modals.
  const discordImports = [
    "Client",
    "EmbedBuilder",
    "GatewayIntentBits",
    "Partials",
    "ButtonBuilder",
    "ButtonStyle",
    "ActionRowBuilder",
    "StringSelectMenuBuilder",
    "StringSelectMenuOptionBuilder",
    ...(hasModals ? ["ModalBuilder", "TextInputBuilder", "TextInputStyle"] : []),
  ].join(", ");

  const botJs = `import { ${discordImports} } from "discord.js";
import Database from "better-sqlite3";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const db = new Database("newt-store.sqlite");
db.exec("CREATE TABLE IF NOT EXISTS store (namespace TEXT NOT NULL, key TEXT NOT NULL, value TEXT, PRIMARY KEY(namespace, key))");
const botName = ${JSON.stringify(botName)};
const prefix = ${JSON.stringify(prefix)};

async function processedFetch(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("HTTP error! status: " + response.status);
  }
  if (response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

function saveValue(namespace, key, value) {
  db.prepare("INSERT OR REPLACE INTO store(namespace, key, value) VALUES (?, ?, ?)").run(String(namespace), String(key), JSON.stringify(value));
}

function loadValue(namespace, key, fallback = undefined) {
  const row = db.prepare("SELECT value FROM store WHERE namespace = ? AND key = ?").get(String(namespace), String(key));
  return row ? JSON.parse(row.value) : fallback;
}

function findChannel(guild, name) {
  return guild?.channels?.cache?.find((ch) => ch.name === name);
}

function findRole(guild, name) {
  return guild?.roles?.cache?.find((r) => r.name === name);
}

client.on("error", (err) => {
  console.error("Discord client error:", err.message);
});

${handlers}

client.login(${tokenExpr});
`;

  return {
    botJs,
    packageJson: JSON.stringify({
      type: "module",
      scripts: { start: "node bot.js" },
      dependencies: {
        "better-sqlite3": "^11.0.0",
        "discord.js": "^14.15.0"
      }
    }, null, 2)
  };
}

function hasShowModal(statements: Statement[]): boolean {
  return statements.some((s) => {
    if (s.type === "ShowModalStatement") return true;
    if (s.type === "IfStatement") return hasShowModal(s.consequent) || hasShowModal(s.alternate);
    if (s.type === "TryCatchStatement") return hasShowModal(s.body) || hasShowModal(s.errorHandler);
    if (s.type === "ForEachStatement") return hasShowModal(s.body);
    return false;
  });
}

function getBotValue(program: Program, kind: BotDecl["kind"]): string | undefined {
  return program.body.find((node): node is BotDecl => node.type === "BotDecl" && node.kind === kind)?.value.value;
}

function emitTopLevel(node: Handler | TimerDecl, prefix: string): string {
  switch (node.type) {
    case "ReadyHandler":
      return `client.once("ready", async () => {
  console.log(\`Bot \${botName} is online!\`);
  for (const guild of client.guilds.cache.values()) {
    const server = guild;
${emitStatements(node.body, "    ", "guild")}
  }
});`;

    case "CommandHandler":
      return `client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix + ${JSON.stringify(node.command)})) return;
  const args = message.content.slice((prefix + ${JSON.stringify(node.command)}).length).trim().split(/\\s+/).filter(Boolean);
  const { author: user, channel, guild: server } = message;
  const target = message.mentions.members?.first() ?? null;
${emitStatements(node.body, "  ", "message")}
});`;

    case "MessageContainsHandler":
      return `client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.includes(${emitExpression(node.needle)})) return;
  const { author: user, channel, guild: server } = message;
${emitStatements(node.body, "  ", "message")}
});`;

    case "MessageUpdateHandler":
      return `client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!newMessage.author || newMessage.author.bot) return;
  const { author: user, channel, guild: server } = newMessage;
${emitStatements(node.body, "  ", "newMessage")}
});`;

    case "MessageDeleteHandler":
      return `client.on("messageDelete", async (message) => {
  if (!message.author || message.author.bot) return;
  const { author: user, channel, guild: server } = message;
${emitStatements(node.body, "  ", "message")}
});`;

    case "JoinHandler":
      return `client.on("guildMemberAdd", async (member) => {
  const { user, guild: server } = member;
  const channel = server.systemChannel ?? findChannel(server, "general");
${emitStatements(node.body, "  ", "member")}
});`;

    // Fix #13: LeaveHandler now defines a `channel` variable, matching JoinHandler.
    // Previously LeaveHandler omitted the channel binding, causing ReferenceError
    // if user wrote `say` or any channel-targeting statement inside `on leave:`.
    case "LeaveHandler":
      return `client.on("guildMemberRemove", async (member) => {
  const { user, guild: server } = member;
  const channel = server.systemChannel ?? findChannel(server, "general");
${emitStatements(node.body, "  ", "member")}
});`;

    case "ReactionAddHandler":
      return `client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot || reaction.emoji.name !== ${emitExpression(node.emoji)}) return;
  const { message } = reaction;
  const { channel, guild: server } = message;
${emitStatements(node.body, "  ", "message")}
});`;

    case "ReactionRemoveHandler":
      return `client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot || reaction.emoji.name !== ${emitExpression(node.emoji)}) return;
  const { message } = reaction;
  const { channel, guild: server } = message;
${emitStatements(node.body, "  ", "message")}
});`;

    case "GuildMemberUpdateHandler":
      return `client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const { user, guild: server } = newMember;
  const channel = server.systemChannel ?? findChannel(server, "general");
${emitStatements(node.body, "  ", "newMember")}
});`;

    case "PresenceUpdateHandler":
      return `client.on("presenceUpdate", async (oldPresence, newPresence) => {
  if (!newPresence) return;
  const { user, guild: server } = newPresence;
  const channel = server ? (server.systemChannel ?? findChannel(server, "general")) : null;
${emitStatements(node.body, "  ", "newPresence")}
});`;

    // Fix #6: Slash command registration now uses client.once("ready") instead of
    // client.on("ready"), preventing duplicate re-registration on reconnects.
    // Also added null check for client.application before calling .commands.create().
    case "SlashCommandHandler": {
      const optionsDef = node.options
        ? node.options.map(opt =>
            `{ name: ${JSON.stringify(opt.name)}, description: ${emitExpression(opt.description)}, type: ${getOptionTypeValue(opt.optionType)}, required: ${opt.required.value} }`
          ).join(", ")
        : "";

      const commandReg = `client.once("ready", async () => {
  try {
    if (!client.application) throw new Error("client.application is null");
    await client.application.commands.create({
      name: ${JSON.stringify(node.command)},
      description: ${node.description ? emitExpression(node.description) : '"No description"'},
      options: [${optionsDef}]
    });
    console.log(\`Registered slash command: /${node.command}\`);
  } catch (err) {
    console.error("Failed to register slash command /${node.command}:", err);
  }
});`;

      const commandHandler = `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== ${JSON.stringify(node.command)}) return;
  const { user, channel, guild: server } = interaction;
  const args = interaction.options;
${emitStatements(node.body, "  ", "interaction")}
});`;

      return commandReg + "\n\n" + commandHandler;
    }

    case "ButtonClickHandler":
      return `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== ${emitExpression(node.buttonId)}) return;
  const { user, channel, guild: server } = interaction;
${emitStatements(node.body, "  ", "interaction")}
});`;

    case "SelectMenuHandler":
      return `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== ${emitExpression(node.menuId)}) return;
  const { user, channel, guild: server, values } = interaction;
${emitStatements(node.body, "  ", "interaction")}
});`;

    case "ModalSubmitHandler":
      return `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== ${emitExpression(node.modalId)}) return;
  const { user, channel, guild: server, fields } = interaction;
${emitStatements(node.body, "  ", "interaction")}
});`;

    case "EveryTimerDecl":
      return `setInterval(async () => {
${emitStatements(node.body, "  ", "client")}
}, ${durationMs(node.amount.value, node.unit)});`;

    case "DailyTimerDecl":
      return `setInterval(async () => {
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);
  if (hhmm !== ${emitExpression(node.time)}) return;
${emitStatements(node.body, "  ", "client")}
}, 60000);`;

    default:
      return "";
  }
}

function emitStatements(statements: Statement[], indent: string, triggerName: string): string {
  return statements.map((s) => emitStatement(s, indent, triggerName)).join("\n");
}

function emitStatement(statement: Statement, indent: string, triggerName: string): string {
  switch (statement.type) {
    case "ReplyStatement":
      if (statement.ephemeral) {
        return `${indent}await ${triggerName}.reply({ content: ${emitExpression(statement.message)}, ephemeral: true });`;
      }
      return `${indent}await ${triggerName}.reply(${emitExpression(statement.message)});`;

    case "SayStatement": {
      if (statement.channel) {
        return `${indent}await findChannel(server, ${emitExpression(statement.channel)})?.send(${emitExpression(statement.message)});`;
      }
      return `${indent}await (channel ?? ${triggerName}.channel)?.send(${emitExpression(statement.message)});`;
    }

    case "SayEmbedStatement":
      return `${indent}await (channel ?? ${triggerName}.channel ?? findChannel(server, "general"))?.send({ embeds: [${emitEmbed(statement.embed)}] });`;

    case "SayComponentsStatement": {
      const components = emitComponents(statement.components);
      return `${indent}await (channel ?? ${triggerName}.channel ?? findChannel(server, "general"))?.send({ content: ${emitExpression(statement.message)}, components: [${components}] });`;
    }

    case "ShowModalStatement": {
      const modalInputs = statement.inputs.map((input: any) => {
        const style = input.style?.value === "paragraph" ? "TextInputStyle.Paragraph" : "TextInputStyle.Short";
        return `new TextInputBuilder().setCustomId(${emitExpression(input.id)}).setLabel(${emitExpression(input.label)}).setStyle(${style}).setRequired(${input.required ?? false})`;
      }).join(", ");
      return `${indent}await interaction.showModal(
${indent}  new ModalBuilder().setCustomId(${emitExpression(statement.modalId)}).setTitle(${emitExpression(statement.title)})
${indent}    .addComponents(new ActionRowBuilder().addComponents(${modalInputs}))
${indent});`;
    }

    case "LetDecl":
      return `${indent}const ${statement.name} = ${emitExpression(statement.value)};`;

    case "StoreStatement":
      return `${indent}saveValue(${emitExpression(statement.namespace)}, ${JSON.stringify(statement.key)}, ${emitExpression(statement.value)});`;

    case "IfStatement":
      return `${indent}if (${emitExpression(statement.condition)}) {\n${emitStatements(statement.consequent, `${indent}  `, triggerName)}\n${indent}}${statement.alternate.length ? ` else {\n${emitStatements(statement.alternate, `${indent}  `, triggerName)}\n${indent}}` : ""}`;

    // Fix #18: ForEachStatement now generates a real for...of loop over the iterable
    // expression rather than hardcoding server.members.cache.values(). Previously
    // the codegen always iterated over guild members regardless of what the user wrote.
    case "ForEachStatement":
      return `${indent}for (const ${statement.itemName} of (${emitExpression(statement.iterable)} ?? [])) {\n${emitStatements(statement.body, `${indent}  `, triggerName)}\n${indent}}`;

    case "RequireRoleStatement":
      return `${indent}if (!${triggerName}.member?.roles?.cache?.some((r) => r.name === ${emitExpression(statement.role)})) { await ${triggerName}.reply({ content: "You don't have permission to use this command.", ephemeral: true }); return; }`;

    case "GiveRoleStatement":
      return `${indent}await (${emitExpression(statement.subject)}?.roles ?? ${triggerName}.member?.roles)?.add(findRole(server ?? ${triggerName}.guild, ${emitExpression(statement.role)}));`;

    case "RemoveRoleStatement":
      return `${indent}await (${emitExpression(statement.subject)}?.roles ?? ${triggerName}.member?.roles)?.remove(findRole(server ?? ${triggerName}.guild, ${emitExpression(statement.role)}));`;

    case "MuteStatement":
      return `${indent}await ${emitExpression(statement.subject)}?.timeout?.(${statement.duration ? durationMs(statement.duration.amount.value, statement.duration.unit) : 600000}, "Muted by bot");`;

    case "KickStatement":
      return `${indent}await ${emitExpression(statement.subject)}?.kick?.("Kicked by bot");`;

    case "BanStatement":
      return `${indent}await ${emitExpression(statement.subject)}?.ban?.({ reason: "Banned by bot" });`;

    case "UnbanStatement":
      return `${indent}await server?.members.unban(${emitExpression(statement.subject)});`;

    case "EditMessageStatement":
      return `${indent}await ${emitExpression(statement.target)}?.edit?.(${emitExpression(statement.newContent)});`;

    case "DeleteMessageStatement":
      return `${indent}await ${emitExpression(statement.target)}?.delete?.();`;

    case "PinStatement":
      return `${indent}await ${emitExpression(statement.target)}?.pin?.();`;

    case "UnpinStatement":
      return `${indent}await ${emitExpression(statement.target)}?.unpin?.();`;

    case "AddReactionStatement":
      return `${indent}await ${emitExpression(statement.target)}?.react?.(${emitExpression(statement.emoji)});`;

    case "RemoveReactionStatement":
      return `${indent}await ${emitExpression(statement.target)}?.reactions?.cache?.get(${emitExpression(statement.emoji)})?.remove();`;

    case "RemoveAllReactionsStatement":
      return `${indent}await ${emitExpression(statement.target)}?.reactions?.removeAll?.();`;

    case "CreateChannelStatement":
      if (statement.channelType) {
        return `${indent}await server?.channels.create({ name: ${emitExpression(statement.name)}, type: ${emitExpression(statement.channelType)} });`;
      }
      return `${indent}await server?.channels.create({ name: ${emitExpression(statement.name)} });`;

    case "DeleteChannelStatement":
      return `${indent}await ${emitExpression(statement.target)}?.delete?.();`;

    case "EditChannelStatement":
      return `${indent}await ${emitExpression(statement.target)}?.setName(${statement.newName ? emitExpression(statement.newName) : '""'});`;

    case "CreateRoleStatement":
      return `${indent}await server?.roles.create({ name: ${emitExpression(statement.name)} });`;

    case "DeleteRoleStatement":
      return `${indent}await ${emitExpression(statement.target)}?.delete?.();`;

    case "EditRoleStatement":
      return `${indent}await ${emitExpression(statement.target)}?.setName(${statement.newName ? emitExpression(statement.newName) : '""'});`;

    case "SendDMStatement":
      return `${indent}await ${emitExpression(statement.target)}?.send(${emitExpression(statement.message)});`;

    case "UploadStatement":
      if (statement.message) {
        return `${indent}await (channel ?? ${triggerName}.channel)?.send({ files: [${emitExpression(statement.filePath)}], content: ${emitExpression(statement.message)} });`;
      }
      return `${indent}await (channel ?? ${triggerName}.channel)?.send({ files: [${emitExpression(statement.filePath)}] });`;

    case "SetActivityStatement":
      return `${indent}client.user?.setActivity(${emitExpression(statement.activity)});`;

    case "TryCatchStatement":
      return `${indent}try {\n${emitStatements(statement.body, `${indent}  `, triggerName)}\n${indent}} catch (error) {\n${emitStatements(statement.errorHandler, `${indent}  `, triggerName)}\n${indent}}`;

    case "WaitStatement":
      return `${indent}await new Promise((resolve) => setTimeout(resolve, ${durationMs(statement.duration.amount.value, statement.duration.unit)}));`;

    case "ExpressionStatement":
      return `${indent}${emitExpression((statement as any).expression)};`;

    // Fix #14: NEWT_E016 is now actually used here — thrown for any statement type
    // that cannot be generated. Previously this error code was defined in errors.ts
    // but never emitted anywhere; codegen threw raw JS errors instead.
    default:
      throw new NewtError({
        code: "NEWT_E016",
        message: `Statement type "${(statement as any).type}" is not supported in generated builds.`,
        suggestion: "Use 'newt run', or remove/replace this feature.",
        line: (statement as any).loc?.line ?? 1,
        column: (statement as any).loc?.column ?? 1,
      });
  }
}

function emitEmbed(embed: any): string {
  let lines = "new EmbedBuilder()";
  if (embed.title) lines += `.setTitle(${emitExpression(embed.title)})`;
  if (embed.description) lines += `.setDescription(${emitExpression(embed.description)})`;
  if (embed.color) lines += `.setColor(${JSON.stringify(embed.color.value)})`;
  if (embed.author) lines += `.setAuthor({ name: ${emitExpression(embed.author)} })`;
  if (embed.footer) lines += `.setFooter({ text: ${emitExpression(embed.footer)} })`;
  if (embed.image) lines += `.setImage(${emitExpression(embed.image)})`;
  if (embed.thumbnail) lines += `.setThumbnail(${emitExpression(embed.thumbnail)})`;
  if (embed.url) lines += `.setURL(${emitExpression(embed.url)})`;
  if (embed.timestamp) lines += `.setTimestamp()`;
  for (const field of embed.fields ?? []) {
    lines += `.addFields({ name: ${emitExpression(field.name)}, value: ${emitExpression(field.value)} })`;
  }
  return lines;
}

function emitExpression(expression: Expression): string {
  switch (expression.type) {
    case "StringLiteral":
      if (expression.interpolated) {
        let result = expression.value.replaceAll("`", "\\`");
        // Map user.name -> user.username for Discord.js v14 compatibility
        result = result.replace(/\{([^}]+)\}/g, (_match, inner: string) => {
          const mapped = inner.trim() === "user.name" ? "user.username" : inner.trim();
          return "${" + mapped + "}";
        });
        return "`" + result + "`";
      }
      return JSON.stringify(expression.value);

    case "NumberLiteral":
    case "BooleanLiteral":
      return String(expression.value);

    case "ColorLiteral":
      return JSON.stringify(expression.value);

    case "IdentifierExpr":
      return expression.name;

    case "MemberExpr": {
      const path = expression.path.join(".");
      // Map user.name -> user.username for Discord.js v14 compatibility
      if (path === "user.name") return "user.username";
      if (path === "member.name") return "member.user.username";
      return path;
    }

    case "ArgsIndexExpr":
      return `args[${expression.index}]`;

    case "LoadExpr":
      return `loadValue(${emitExpression(expression.namespace)}, ${JSON.stringify(expression.key)}${expression.fallback ? `, ${emitExpression(expression.fallback)}` : ""})`;

    case "FetchExpr":
      return `(await processedFetch(${emitExpression(expression.url)}))`;

    case "GetUserExpr":
      return `(await client.users.fetch(String(${emitExpression(expression.userId)})))`;

    case "GetGuildExpr":
      return `(await client.guilds.fetch(String(${emitExpression(expression.guildId)})))`;

    case "RandomExpr":
      if (expression.min && expression.max) {
        return `(Math.floor(Math.random() * (${emitExpression(expression.max)} - ${emitExpression(expression.min)} + 1)) + ${emitExpression(expression.min)})`;
      }
      return "Math.random()";

    case "GetReactionUsersExpr":
      return `(await (await client.channels.fetch(String(channel?.id)))?.messages?.fetch(String(${emitExpression(expression.messageId)})))?.reactions?.cache?.get(${emitExpression(expression.emoji)})?.users?.fetch()`;

    // Fix #3: BinaryExpr now correctly maps "and" -> "&&" and boolean "or" -> "||"
    // in generated JavaScript. Previously "and" was emitted literally, causing
    // a JS syntax error. "or" was mapped to ?? (nullish coalescing) which is
    // semantically wrong for boolean logic — it is now "||".
    // The load fallback case (load x y or default) is handled at the LoadExpr level.
    case "BinaryExpr": {
      const opMap: Record<string, string> = {
        "and": "&&",
        "or": "||",
        "not": "!",
        "==": "===",
        "!=": "!==",
        "has": "has", // special — handled below
      };
      if (expression.operator === "has") {
        return `(${triggerOrMessage}.member?.roles?.cache?.some((r) => r.name === ${emitExpression(expression.right)}) ?? false)`;
      }
      const jsOp = opMap[expression.operator] ?? expression.operator;
      return `(${emitExpression(expression.left)} ${jsOp} ${emitExpression(expression.right)})`;
    }

    case "UnaryExpr": {
      const op = expression.operator === "not" ? "!" : expression.operator;
      return `(${op}${emitExpression(expression.argument)})`;
    }

    case "CallExpr":
      return `${expression.callee}(${expression.args.map(emitExpression).join(", ")})`;

    default:
      return "undefined";
  }
}

// Placeholder used only in has-operator fallback above; real triggerName is passed via emitStatement
const triggerOrMessage = "message";

const DURATION_MULTIPLIERS: Record<string, number> = {
  second: 1000, seconds: 1000,
  minute: 60000, minutes: 60000,
  hour: 3600000, hours: 3600000,
  day: 86400000, days: 86400000
};

function durationMs(amount: number, unit: string): number {
  return amount * (DURATION_MULTIPLIERS[unit] ?? 1000);
}

const OPTION_TYPES: Record<string, number> = {
  string: 3, number: 4, boolean: 5, user: 6, channel: 7, role: 8
};

function getOptionTypeValue(type: string): number {
  return OPTION_TYPES[type] ?? OPTION_TYPES.string;
}

function emitComponents(components: any[]): string {
  const rows: string[] = [];
  let currentRow: string[] = [];

  for (const component of components) {
    if (component.type === "ButtonComponent") {
      let btn = `new ButtonBuilder().setCustomId(${emitExpression(component.id)}).setLabel(${emitExpression(component.label)})`;
      if (component.url) {
        btn += `.setStyle(ButtonStyle.Link).setURL(${emitExpression(component.url)})`;
      } else {
        const styleMap: Record<string, string> = {
          primary: "ButtonStyle.Primary", secondary: "ButtonStyle.Secondary",
          success: "ButtonStyle.Success", danger: "ButtonStyle.Danger", link: "ButtonStyle.Link"
        };
        btn += `.setStyle(${styleMap[(component.style?.value ?? "primary").toLowerCase()] ?? "ButtonStyle.Primary"})`;
      }
      currentRow.push(btn);
    } else if (component.type === "SelectMenuComponent") {
      let menu = `new StringSelectMenuBuilder().setCustomId(${emitExpression(component.id)})`;
      if (component.options?.length) {
        menu += `.setOptions(${component.options.map((opt: any) =>
          `new StringSelectMenuOptionBuilder().setLabel(${emitExpression(opt.label)}).setValue(${emitExpression(opt.value)})`
        ).join(", ")})`;
      }
      currentRow.push(menu);
    }
  }

  if (currentRow.length > 0) {
    rows.push(`new ActionRowBuilder().addComponents(${currentRow.join(", ")})`);
  }

  return rows.join(", ");
}
