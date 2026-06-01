import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import Database from "better-sqlite3";
import type {
  Program,
  Handler,
  Statement,
  Expression,
  BotDecl,
  StringLiteral,
  IdentifierExpr,
  MemberExpr,
  BinaryExpr,
  UnaryExpr,
  CallExpr,
  LoadExpr,
  FetchExpr,
  GetUserExpr,
  GetGuildExpr,
  DurationLiteral,
} from "@newt-dev/compiler";

interface InterpreterOptions {
  token: string;
  program: Program;
}

interface ExecutionContext {
  user: any;
  channel: any;
  server: any;
  message?: any;
  target?: any;
  variables: Map<string, any>;
}

export class NewtInterpreter {
  private client: Client;
  private db: Database.Database;
  private program: Program;
  private botName: string;
  private prefix: string;
  private token: string;

  constructor(options: InterpreterOptions) {
    this.program = options.program;
    this.token = options.token;
    this.botName = this.getBotValue("name") ?? "NewtBot";
    this.prefix = this.getBotValue("prefix") ?? "!";

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    // Increase max listeners to avoid warnings with multiple command handlers
    this.client.setMaxListeners(20);

    // Handle unhandled errors
    this.client.on('error', (error) => {
      console.error('Discord client error:', error.message);
    });

    this.db = new Database(":memory:");
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS store (namespace TEXT NOT NULL, key TEXT NOT NULL, value TEXT, PRIMARY KEY(namespace, key))"
    );

    this.setupHandlers();
  }

  private getBotValue(kind: BotDecl["kind"]): string | undefined {
    return this.program.body.find(
      (node): node is BotDecl => node.type === "BotDecl" && node.kind === kind
    )?.value.value;
  }

  private setupHandlers(): void {
    const handlers = this.program.body.filter(
      (node): node is Handler => node.type.endsWith("Handler")
    );

    for (const handler of handlers) {
      switch (handler.type) {
        case "ReadyHandler":
          this.client.once("clientReady", async () => {
            console.log(`Bot ${this.botName} is online!`);
            const context: ExecutionContext = {
              user: this.client.user,
              channel: null,
              server: null,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "CommandHandler":
          this.client.on("messageCreate", async (message) => {
            if (message.author.bot) return;
            if (!message.content.startsWith(this.prefix + handler.command)) return;

            const context: ExecutionContext = {
              user: message.author,
              channel: message.channel,
              server: message.guild,
              message,
              target: message.mentions.members?.first(),
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "MessageContainsHandler":
          this.client.on("messageCreate", async (message) => {
            if (message.author.bot) return;
            if (!message.content.includes(handler.needle.value)) return;

            const context: ExecutionContext = {
              user: message.author,
              channel: message.channel,
              server: message.guild,
              message,
              target: message.mentions.members?.first(),
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "JoinHandler":
          this.client.on("guildMemberAdd", async (member) => {
            const context: ExecutionContext = {
              user: member.user,
              channel: member.guild.systemChannel,
              server: member.guild,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "LeaveHandler":
          this.client.on("guildMemberRemove", async (member) => {
            const context: ExecutionContext = {
              user: member.user,
              channel: member.guild.systemChannel,
              server: member.guild,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "ReactionAddHandler":
          this.client.on("messageReactionAdd", async (reaction, user) => {
            if (user.bot) return;
            if (reaction.emoji.name !== handler.emoji.value) return;

            const context: ExecutionContext = {
              user,
              channel: reaction.message.channel,
              server: reaction.message.guild,
              message: reaction.message,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "MessageUpdateHandler":
          this.client.on("messageUpdate", async (oldMessage, newMessage) => {
            if (newMessage.author?.bot) return;
            const context: ExecutionContext = {
              user: newMessage.author,
              channel: newMessage.channel,
              server: newMessage.guild,
              message: newMessage,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "MessageDeleteHandler":
          this.client.on("messageDelete", async (message) => {
            if (message.author?.bot) return;
            const context: ExecutionContext = {
              user: message.author,
              channel: message.channel,
              server: message.guild,
              message,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;
      }
    }
  }

  private async executeStatements(
    statements: Statement[],
    context: ExecutionContext
  ): Promise<void> {
    for (const stmt of statements) {
      await this.executeStatement(stmt, context);
    }
  }

  private async executeStatement(
    stmt: Statement,
    context: ExecutionContext
  ): Promise<void> {
    try {
      switch (stmt.type) {
        case "ReplyStatement":
          const replyText = await this.evaluateExpression(stmt.message, context);
          await context.message?.reply(replyText);
          break;

        case "SayStatement":
          const sayText = await this.evaluateExpression(stmt.message, context);
          const targetChannel = stmt.channel
            ? this.findChannel(context.server, stmt.channel.value)
            : context.channel;
          if (!targetChannel) {
            console.error(`Channel not found: ${stmt.channel?.value || 'current'}`);
            return;
          }
          await targetChannel.send(sayText);
          break;

        case "SayEmbedStatement":
          const embed = this.buildEmbed(stmt.embed, context);
          await context.channel?.send({ embeds: [embed] });
          break;

        case "SayComponentsStatement":
          const compMessage = await this.evaluateExpression(stmt.message, context);
          const components = this.buildComponents(stmt.components);
          await context.channel?.send({
            content: compMessage,
            components: components
          });
          break;

        case "LetDecl":
          const value = await this.evaluateExpression(stmt.value, context);
          context.variables.set(stmt.name, value);
          break;

        case "StoreStatement":
          const storeValue = await this.evaluateExpression(stmt.value, context);
          const namespace = await this.evaluateExpression(stmt.namespace, context);
          this.saveValue(namespace, stmt.key, storeValue);
          break;

        case "IfStatement":
          const condition = await this.evaluateExpression(stmt.condition, context);
          if (condition) {
            await this.executeStatements(stmt.consequent, context);
          } else if (stmt.alternate && stmt.alternate.length > 0) {
            await this.executeStatements(stmt.alternate, context);
          }
          break;

        case "ForEachStatement":
          const collection = await this.evaluateExpression(stmt.iterable, context);
          for (const item of collection) {
            const loopContext = {
              ...context,
              variables: new Map(context.variables),
            };
            loopContext.variables.set(stmt.itemName, item);
            await this.executeStatements(stmt.body, loopContext);
          }
          break;

        case "EditMessageStatement":
          const editText = await this.evaluateExpression(stmt.newContent, context);
          const editTarget = await this.evaluateExpression(stmt.target, context);
          await editTarget?.edit(editText);
          break;

        case "DeleteMessageStatement":
          const deleteTarget = await this.evaluateExpression(stmt.target, context);
          await deleteTarget?.delete();
          break;

        case "UploadStatement":
          const uploadMessage = stmt.message
            ? await this.evaluateExpression(stmt.message, context)
            : undefined;
          const filePath = await this.evaluateExpression(stmt.filePath, context);
          await context.channel?.send({
            files: [filePath],
            content: uploadMessage,
          });
          break;

        case "SetActivityStatement":
          const activity = await this.evaluateExpression(stmt.activity, context);
          this.client.user?.setActivity(activity);
          break;

        case "TryCatchStatement":
          try {
            await this.executeStatements(stmt.body, context);
          } catch (error) {
            if (stmt.errorHandler && stmt.errorHandler.length > 0) {
              await this.executeStatements(stmt.errorHandler, context);
            }
          }
          break;

        case "WaitStatement":
          const duration = this.parseDuration(stmt.duration);
          await new Promise((resolve) => setTimeout(resolve, duration * 1000));
          break;

        case "GiveRoleStatement":
          const giveSubject = await this.evaluateExpression(stmt.subject, context);
          const role = this.findRole(context.server, stmt.role.value);
          if (!role) {
            console.error(`Role not found: ${stmt.role.value}`);
            return;
          }
          if (!giveSubject) {
            console.error(`Subject not found for give role`);
            return;
          }
          try {
            // User object doesn't have roles, need to get GuildMember
            const member = giveSubject.roles ? giveSubject : await context.server.members.fetch(giveSubject.id);
            await member.roles.add(role);
          } catch (error) {
            console.error(`Failed to add role: ${error}`);
          }
          break;

        case "RemoveRoleStatement":
          const removeSubject = await this.evaluateExpression(stmt.subject, context);
          const removeRole = this.findRole(context.server, stmt.role.value);
          if (!removeRole) {
            console.error(`Role not found: ${stmt.role.value}`);
            return;
          }
          if (!removeSubject) {
            console.error(`Subject not found for remove role`);
            return;
          }
          try {
            // User object doesn't have roles, need to get GuildMember
            const member = removeSubject.roles ? removeSubject : await context.server.members.fetch(removeSubject.id);
            await member.roles.remove(removeRole);
          } catch (error) {
            console.error(`Failed to remove role: ${error}`);
          }
          break;

        case "MuteStatement":
          const muteSubject = await this.evaluateExpression(stmt.subject, context);
          const muteRole = this.findRole(context.server, "Muted");
          if (!muteRole) {
            console.error(`Muted role not found`);
            return;
          }
          if (!muteSubject) {
            console.error(`Subject not found for mute`);
            return;
          }
          await muteSubject.roles.add(muteRole);
          if (stmt.duration) {
            const muteDuration = this.parseDuration(stmt.duration);
            setTimeout(async () => {
              try {
                const member = await context.server.members.fetch(muteSubject.id);
                await member.roles.remove(muteRole);
              } catch (error) {
                console.error(`Failed to unmute user (may have left server): ${error}`);
              }
            }, muteDuration * 1000);
          }
          break;

        case "KickStatement":
          const kickSubject = await this.evaluateExpression(stmt.subject, context);
          if (kickSubject) {
            await kickSubject.kick();
          }
          break;

        case "BanStatement":
          const banSubject = await this.evaluateExpression(stmt.subject, context);
          if (banSubject) {
            await banSubject.ban();
          }
          break;

        case "ExpressionStatement":
          await this.evaluateExpression(stmt.expression, context);
          break;

        default:
          console.warn(`Unknown statement type: ${(stmt as any).type}`);
      }
    } catch (error) {
      throw this.translateError(error as Error);
    }
  }

  private async evaluateExpression(
    expr: Expression,
    context: ExecutionContext
  ): Promise<any> {
    switch (expr.type) {
      case "StringLiteral":
        if (expr.interpolated) {
          // Handle template string interpolation
          let result = expr.value;
          // Replace {variable} with actual values
          result = result.replace(/\{([^}]+)\}/g, (match, path) => {
            const parts = path.split('.');
            let value: any;
            
            // First check if it's a variable in context.variables
            if (context.variables.has(parts[0])) {
              value = context.variables.get(parts[0]);
              // Traverse nested properties if needed
              for (let i = 1; i < parts.length; i++) {
                value = value?.[parts[i]];
              }
            } else {
              // Otherwise check context properties (user, server, etc.)
              value = context;
              for (const part of parts) {
                value = value?.[part];
              }
            }
            
            return value !== undefined && value !== null ? String(value) : match;
          });
          return result;
        }
        return expr.value;

      case "NumberLiteral":
        return expr.value;

      case "BooleanLiteral":
        return expr.value;

      case "ColorLiteral":
        return expr.value;

      case "IdentifierExpr":
        if (expr.name === "user") return context.user;
        if (expr.name === "channel") return context.channel;
        if (expr.name === "server") return context.server;
        if (expr.name === "message") return context.message;
        if (expr.name === "target") return context.target;
        return context.variables.get(expr.name);

      case "MemberExpr":
        let result: any = context;
        for (const part of expr.path) {
          result = result?.[part];
        }
        return result;

      case "ArgsIndexExpr":
        const argsList = context.variables.get("args") || [];
        return argsList[expr.index];

      case "LoadExpr":
        const loadNamespace = await this.evaluateExpression(expr.namespace, context);
        const loadKey = expr.key;
        const fallback = expr.fallback
          ? await this.evaluateExpression(expr.fallback, context)
          : undefined;
        return this.loadValue(loadNamespace, loadKey, fallback);

      case "FetchExpr":
        const url = await this.evaluateExpression(expr.url, context);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type')?.toLowerCase();
        if (contentType === 'application/json') {
          return await response.json();
        }
        return await response.text();

      case "BinaryExpr":
        const left = await this.evaluateExpression(expr.left, context);
        const right = await this.evaluateExpression(expr.right, context);
        switch (expr.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          case "==":
            return left == right;
          case "!=":
            return left != right;
          case "<":
            return left < right;
          case ">":
            return left > right;
          case "<=":
            return left <= right;
          case ">=":
            return left >= right;
          case "and":
            return left && right;
          case "or":
            return left || right;
          default:
            throw new Error(`Unknown operator: ${expr.operator}`);
        }

      case "UnaryExpr":
        const operand = await this.evaluateExpression(expr.argument, context);
        switch (expr.operator) {
          case "not":
            return !operand;
          case "-":
            return -operand;
          default:
            throw new Error(`Unknown unary operator: ${expr.operator}`);
        }

      case "CallExpr":
        const callee = context.variables.get(expr.callee);
        const callArgs = await Promise.all(
          expr.args.map((arg) => this.evaluateExpression(arg, context))
        );
        return callee(...callArgs);

      case "GetUserExpr":
        const userId = await this.evaluateExpression(expr.userId, context);
        return await this.client.users.fetch(userId);

      case "GetGuildExpr":
        const guildId = await this.evaluateExpression(expr.guildId, context);
        return await this.client.guilds.fetch(guildId);

      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  private parseDuration(duration: DurationLiteral): number {
    const value = duration.amount.value;
    const unit = duration.unit;
    
    switch (unit) {
      case "second":
      case "seconds":
        return value;
      case "minute":
      case "minutes":
        return value * 60;
      case "hour":
      case "hours":
        return value * 3600;
      case "day":
      case "days":
        return value * 86400;
      default:
        return value;
    }
  }

  private findChannel(guild: any, name: string): any {
    return guild?.channels?.cache?.find((channel: any) => channel.name === name);
  }

  private findRole(guild: any, name: string): any {
    return guild?.roles?.cache?.find((role: any) => role.name === name);
  }

  private buildEmbed(embed: any, context: ExecutionContext): any {
    const built = new EmbedBuilder();
    
    if (embed.title) built.setTitle(embed.title.value);
    if (embed.description) built.setDescription(embed.description.value);
    if (embed.color) built.setColor(embed.color.value);
    
    for (const field of embed.fields) {
      built.addFields({
        name: field.name.value,
        value: field.value.value
      });
    }
    
    return built;
  }

  private buildComponents(components: any[]): any {
    const rows: any[] = [];
    
    for (const comp of components) {
      if (comp.type === "ButtonComponent") {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(comp.id.value)
            .setLabel(comp.label?.value || "Button")
            .setStyle(ButtonStyle.Primary)
        );
        rows.push(row);
      } else if (comp.type === "SelectMenuComponent") {
        const options = comp.options?.map((opt: any) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(opt.label?.value || "Option")
            .setValue(opt.value?.value || "value")
        ) || [];
        
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(comp.id.value)
            .setOptions(options)
        );
        rows.push(row);
      }
    }
    
    return rows;
  }

  private saveValue(namespace: string, key: string, value: any): void {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO store(namespace, key, value) VALUES (?, ?, ?)"
      )
      .run(String(namespace), String(key), JSON.stringify(value));
  }

  private loadValue(namespace: string, key: string, fallback?: any): any {
    const row = this.db
      .prepare("SELECT value FROM store WHERE namespace = ? AND key = ?")
      .get(String(namespace), String(key)) as { value: string } | undefined;
    return row ? JSON.parse(row.value) : fallback;
  }

  private translateError(error: Error): Error {
    const message = error.message.toLowerCase();

    if (message.includes("missing access")) {
      return new Error("I don't have permission to do that");
    }
    if (message.includes("unknown user")) {
      return new Error("I couldn't find that user");
    }
    if (message.includes("unknown channel")) {
      return new Error("I couldn't find that channel");
    }
    if (message.includes("rate limit")) {
      return new Error("I'm sending messages too fast, please wait");
    }
    if (message.includes("invalid form body")) {
      return new Error("Something went wrong with that request");
    }

    return error;
  }

  async run(): Promise<void> {
    const tokenDecl = this.program.body.find(
      (node): node is BotDecl => node.type === "BotDecl" && node.kind === "token"
    );
    
    if (tokenDecl?.fromEnv) {
      // Use the token passed to the interpreter (from CLI storage)
      await this.client.login(this.token);
    } else {
      // Use the literal token value from the .newt file
      await this.client.login(tokenDecl?.value.value || "");
    }
  }
}
