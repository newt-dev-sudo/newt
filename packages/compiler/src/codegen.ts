import type {
  BotDecl,
  Expression,
  Handler,
  Program,
  Statement,
  TimerDecl
} from "./ast.js";

export interface GeneratedProject {
  botJs: string;
  packageJson: string;
}

export function generate(program: Program): GeneratedProject {
  const botName = getBotValue(program, "name") ?? "NewtBot";
  const prefix = getBotValue(program, "prefix") ?? "!";
  const tokenDecl = program.body.find((node): node is BotDecl => node.type === "BotDecl" && node.kind === "token");
  const tokenExpr = tokenDecl?.fromEnv ? `process.env.${tokenDecl.value.value}` : JSON.stringify(tokenDecl?.value.value ?? "");
  const handlers = program.body
    .filter((node): node is Handler | TimerDecl => node.type.endsWith("Handler") || node.type.endsWith("TimerDecl"))
    .map((node) => emitTopLevel(node, prefix))
    .join("\n\n");

  const botJs = `import { Client, EmbedBuilder, GatewayIntentBits, Partials, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle } from "discord.js";
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

  if (response.headers.get('content-type')?.toLowerCase() === 'application/json') {
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
  return guild?.channels?.cache?.find((channel) => channel.name === name);
}

function findRole(guild, name) {
  return guild?.roles?.cache?.find((role) => role.name === name);
}

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

function getBotValue(program: Program, kind: BotDecl["kind"]): string | undefined {
  return program.body.find((node): node is BotDecl => node.type === "BotDecl" && node.kind === kind)?.value.value;
}

function emitTopLevel(node: Handler | TimerDecl, prefix: string): string {
  switch (node.type) {
    case "ReadyHandler":
      return `client.once("ready", async () => {
  for (const guild of client.guilds.cache.values()) {
    const server = guild;
${emitStatements(node.body, "    ", "guild")}
  }
});`;
    case "CommandHandler":
      return `client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix + ${JSON.stringify(node.command)})) return;
  const args = message.content.slice((prefix + ${JSON.stringify(node.command)}).length).trim().split(/\\s+/).filter(Boolean);
  const user = message.author;
  const channel = message.channel;
  const server = message.guild;
  const target = message.mentions.members.first();
${emitStatements(node.body, "  ", "message")}
});`;
    case "MessageContainsHandler":
      return `client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.includes(${emitExpression(node.needle)})) return;
  const user = message.author;
  const channel = message.channel;
  const server = message.guild;
${emitStatements(node.body, "  ", "message")}
});`;
    case "JoinHandler":
      return `client.on("guildMemberAdd", async (member) => {
  const user = member.user;
  const server = member.guild;
  const channel = findChannel(server, "general");
${emitStatements(node.body, "  ", "member")}
});`;
    case "LeaveHandler":
      return `client.on("guildMemberRemove", async (member) => {
  const user = member.user;
  const server = member.guild;
${emitStatements(node.body, "  ", "member")}
});`;
    case "ReactionAddHandler":
      return `client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.emoji.name !== ${emitExpression(node.emoji)}) return;
  const message = reaction.message;
  const channel = message.channel;
  const server = message.guild;
${emitStatements(node.body, "  ", "message")}
});`;
    case "SlashCommandHandler":
      const optionsDef = node.options ? node.options.map(opt => 
        `{
          name: "${opt.name}",
          description: ${emitExpression(opt.description)},
          type: ${getOptionTypeValue(opt.optionType)},
          required: ${opt.required.value}
        }`
      ).join(",\n          ") : "";
      
      const commandReg = `client.on("ready", async () => {
  try {
    await client.application.commands.create({
      name: "${node.command}",
      description: ${node.description ? emitExpression(node.description) : '"No description"'},
      options: [${optionsDef}]
    });
  } catch (err) {
    console.error("Failed to register slash command:", err);
  }
});`;
      
      const commandHandler = `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "${node.command}") return;
  const user = interaction.user;
  const channel = interaction.channel;
  const server = interaction.guild;
  const args = interaction.options;
${emitStatements(node.body, "  ", "interaction")}
});`;
      
      return commandReg + "\n\n" + commandHandler;
    case "ButtonClickHandler":
      return `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== ${emitExpression(node.buttonId)}) return;
  const user = interaction.user;
  const channel = interaction.channel;
  const server = interaction.guild;
${emitStatements(node.body, "  ", "interaction")}
});`;
    case "SelectMenuHandler":
      return `client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu() || interaction.customId !== ${emitExpression(node.menuId)}) return;
  const user = interaction.user;
  const channel = interaction.channel;
  const server = interaction.guild;
  const values = interaction.values;
${emitStatements(node.body, "  ", "interaction")}
});`;
    case "EveryTimerDecl":
      return `setInterval(async () => {\n${emitStatements(node.body, "  ", "message")}\n}, ${durationMs(node.amount.value, node.unit)});`;
    case "DailyTimerDecl":
      return `setInterval(async () => {
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);
  if (hhmm !== ${emitExpression(node.time)}) return;
${emitStatements(node.body, "  ", "message")}
}, 60000);`;
    default:
      return "";
  }
}

function emitStatements(statements: Statement[], indent: string, triggerName: string): string {
  return statements.map((statement) => emitStatement(statement, indent, triggerName)).join("\n");
}

function emitStatement(statement: Statement, indent: string, triggerName: string): string {
  switch (statement.type) {
    case "ReplyStatement":
      return `${indent}await ${triggerName}.reply(${emitExpression(statement.message)});`;
    case "SayStatement": {
      if (statement.channel) {
        return `${indent}await findChannel(${triggerName === "guild" ? "server" : `server ?? ${triggerName}.guild`}, ${emitExpression(statement.channel)})?.send(${emitExpression(statement.message)});`;
      }
      return `${indent}await (${triggerName}.channel ?? channel)?.send(${emitExpression(statement.message)});`;
    }
    case "SayEmbedStatement":
      if (triggerName === "member") {
        return `${indent}await findChannel(server, "general")?.send({ embeds: [${emitEmbed(statement.embed)}] });`;
      }
      return `${indent}await (${triggerName}.channel ?? channel)?.send({ embeds: [${emitEmbed(statement.embed)}] });`;
    case "SayComponentsStatement":
      const components = emitComponents(statement.components);
      if (triggerName === "member") {
        return `${indent}await findChannel(server, "general")?.send({ content: ${emitExpression(statement.message)}, components: [${components}] });`;
      }
      return `${indent}await (${triggerName}.channel ?? channel)?.send({ content: ${emitExpression(statement.message)}, components: [${components}] });`;
    case "LetDecl":
      return `${indent}const ${statement.name} = ${emitExpression(statement.value)};`;
    case "StoreStatement":
      return `${indent}saveValue(${emitExpression(statement.namespace)}, ${JSON.stringify(statement.key)}, ${emitExpression(statement.value)});`;
    case "IfStatement":
      return `${indent}if (${emitExpression(statement.condition)}) {\n${emitStatements(statement.consequent, `${indent}  `, triggerName)}\n${indent}}${statement.alternate.length ? ` else {\n${emitStatements(statement.alternate, `${indent}  `, triggerName)}\n${indent}}` : ""}`;
    case "ForEachStatement":
      return `${indent}for (const ${statement.itemName} of (server?.members?.cache?.values?.() ?? [])) {\n${emitStatements(statement.body, `${indent}  `, triggerName)}\n${indent}}`;
    case "RequireRoleStatement":
      return `${indent}if (!${triggerName}.member?.roles?.cache?.some((role) => role.name === ${emitExpression(statement.role)})) return;`;
    case "GiveRoleStatement":
      if (triggerName === "member") {
        return `${indent}await ${triggerName}.roles?.add(findRole(server, ${emitExpression(statement.role)}));`;
      }
      return `${indent}await (${emitExpression(statement.subject)}?.roles ?? ${triggerName}.member?.roles)?.add(findRole(server ?? ${triggerName}.guild, ${emitExpression(statement.role)}));`;
    case "RemoveRoleStatement":
      return `${indent}await (${emitExpression(statement.subject)}?.roles ?? ${triggerName}.member?.roles)?.remove(findRole(server ?? ${triggerName}.guild, ${emitExpression(statement.role)}));`;
    case "MuteStatement":
      return `${indent}await ${emitExpression(statement.subject)}?.timeout?.(${statement.duration ? durationMs(statement.duration.amount.value, statement.duration.unit) : 600000});`;
    case "KickStatement":
      return `${indent}await ${emitExpression(statement.subject)}?.kick?.();`;
    case "BanStatement":
      return `${indent}await ${emitExpression(statement.subject)}?.ban?.();`;
    case "TryCatchStatement":
      return `${indent}try {\n${emitStatements(statement.body, `${indent}  `, triggerName)}\n${indent}} catch (error) {\n${emitStatements(statement.errorHandler, `${indent}  `, triggerName)}\n${indent}}`;
    case "WaitStatement":
      return `${indent}await new Promise((resolve) => setTimeout(resolve, ${durationMs(statement.duration.amount.value, statement.duration.unit)}));`;
    case "ExpressionStatement":
      return `${indent}${emitExpression(statement.expression)};`;
    default:
      return `${indent}// TODO: ${statement.type}`;
  }
}

function emitEmbed(embed: { title?: Expression; description?: Expression; color?: { value: string }; fields: { name: Expression; value: Expression }[] }): string {
  const lines = ["new EmbedBuilder()"];
  if (embed.title) lines.push(`.setTitle(${emitExpression(embed.title)})`);
  if (embed.description) lines.push(`.setDescription(${emitExpression(embed.description)})`);
  if (embed.color) lines.push(`.setColor(${JSON.stringify(embed.color.value)})`);
  for (const field of embed.fields) {
    lines.push(`.addFields({ name: ${emitExpression(field.name)}, value: ${emitExpression(field.value)} })`);
  }
  return lines.join("");
}

function emitExpression(expression: Expression): string {
  switch (expression.type) {
    case "StringLiteral":
      if (expression.interpolated) {
        // Replace {expr} placeholders with properly emitted expressions
        let result = expression.value.replace(/`/g, "\\`");
        // Find all {expr} patterns and replace them
        result = result.replace(/\{([^}]+)\}/g, (match, exprContent) => {
          // Map user.name to user.username for Discord.js v14 compatibility
          if (exprContent === "user.name") {
            return "${user.username}";
          }
          if (exprContent === "member.name") {
            return "${member.user.username}";
          }
          return "${" + exprContent + "}";
        });
        return "`" + result + "`";
      }
      return JSON.stringify(expression.value);
    case "NumberLiteral":
      return String(expression.value);
    case "BooleanLiteral":
      return String(expression.value);
    case "ColorLiteral":
      return JSON.stringify(expression.value);
    case "IdentifierExpr":
      return expression.name;
    case "MemberExpr":
      // Map user.name to user.username for Discord.js v14 compatibility
      if (expression.path.join(".") === "user.name") {
        return "user.username";
      }
      // Map member.name to member.user.username for Discord.js v14 compatibility
      if (expression.path.join(".") === "member.name") {
        return "member.user.username";
      }
      return expression.path.join(".");
    case "ArgsIndexExpr":
      return `args[${expression.index}]`;
    case "LoadExpr":
      return `loadValue(${emitExpression(expression.namespace)}, ${JSON.stringify(expression.key)}${expression.fallback ? `, ${emitExpression(expression.fallback)}` : ""})`;
    case "FetchExpr":
      return `await processedFetch(${emitExpression(expression.url)})`;
    case "BinaryExpr":
      if (expression.operator === "or") {
        return `(${emitExpression(expression.left)} ?? ${emitExpression(expression.right)})`;
      }
      if (expression.operator === "has") {
        return `(message.member?.roles?.cache?.some((role) => role.name === ${emitExpression(expression.right)}) ?? false)`;
      }
      return `(${emitExpression(expression.left)} ${expression.operator} ${emitExpression(expression.right)})`;
    case "UnaryExpr":
      return `(${expression.operator}${emitExpression(expression.argument)})`;
    case "CallExpr":
      return `${expression.callee}(${expression.args.map(emitExpression).join(", ")})`;
    default:
      return "undefined";
  }
}

function durationMs(amount: number, unit: string): number {
  const multipliers: Record<string, number> = {
    second: 1000,
    seconds: 1000,
    minute: 60000,
    minutes: 60000,
    hour: 3600000,
    hours: 3600000,
    day: 86400000,
    days: 86400000
  };
  return amount * (multipliers[unit] ?? 1000);
}

function getOptionTypeValue(type: string): number {
  const types: Record<string, number> = {
    string: 3,
    number: 4,
    boolean: 5,
    user: 6,
    channel: 7,
    role: 8
  };
  return types[type] ?? 3;
}

function emitComponents(components: any[]): string {
  const rows: string[] = [];
  let currentRow: string[] = [];
  
  for (const component of components) {
    if (component.type === "ButtonComponent") {
      currentRow.push(`new ButtonBuilder()
        .setCustomId(${emitExpression(component.id)})
        .setLabel(${emitExpression(component.label)})
        .setStyle(ButtonStyle.Primary)`);
    } else if (component.type === "SelectMenuComponent") {
      currentRow.push(`new StringSelectMenuBuilder()
        .setCustomId(${emitExpression(component.id)})
        .setOptions(${component.options.map((opt: any) => 
          `new StringSelectMenuOptionBuilder()
            .setLabel(${emitExpression(opt.label)})
            .setValue(${emitExpression(opt.value)})`
        ).join(", ")})`);
    }
  }
  
  if (currentRow.length > 0) {
    rows.push(`new ActionRowBuilder().addComponents(${currentRow.join(", ")})`);
  }
  
  return rows.join(", ");
}
