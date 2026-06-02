import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, UserSelectMenuBuilder, MentionableSelectMenuBuilder } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } from "@discordjs/voice";
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
  RandomExpr,
  GetReactionUsersExpr,
  DurationLiteral,
  TimerDecl,
  ArrayLiteral,
  ObjectLiteral,
  ObjectProperty,
  StringMethodExpr,
  ArrayLengthExpr,
  ArrayAccessExpr,
  FindRoleExpr,
  FindChannelExpr,
  FindUserExpr,
  ReplyExpr,
  JoinVoiceStatement,
  LeaveVoiceStatement,
  PlayAudioStatement,
  StopAudioStatement,
  PauseAudioStatement,
  ResumeAudioStatement,
  SetVolumeStatement,
  CreateWebhookStatement,
  ExecuteWebhookStatement,
  EditWebhookStatement,
  DeleteWebhookStatement,
  CreateThreadStatement,
  ArchiveThreadStatement,
  LockThreadStatement,
  UnlockThreadStatement,
  SubcommandGroupStatement,
  PushStatement,
  RandomPickStatement,
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
  args?: any[];
  interaction?: any;
  values?: string[];
  fields?: any;
  variables: Map<string, any>;
}

interface VoiceState {
  connection: any;
  player: any;
  queue: string[];
  volume: number;
}

export class NewtInterpreter {
  private client: Client;
  private db: Database.Database;
  private program: Program;
  private botName: string;
  private prefix: string;
  private token: string;
  private voiceState: Map<string, VoiceState>;

  constructor(options: InterpreterOptions) {
    this.program = options.program;
    this.token = options.token;
    this.botName = this.getBotValue("name") ?? "NewtBot";
    this.prefix = this.getBotValue("prefix") ?? "!";
    this.voiceState = new Map();

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    // Increase max listeners to avoid warnings with multiple command handlers
    this.client.setMaxListeners(30);

    // Handle unhandled errors
    this.client.on('error', (error) => {
      console.error('Discord client error:', error.message);
    });

    this.db = new Database("newt-store.sqlite");
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

    const timers = this.program.body.filter(
      (node): node is TimerDecl => node.type.endsWith("TimerDecl")
    );

    for (const timer of timers) {
      if (timer.type === "EveryTimerDecl") {
        const duration = this.parseDuration(timer.unit) * timer.amount.value;
        setInterval(async () => {
          const context: ExecutionContext = {
            user: this.client.user,
            channel: null,
            server: null,
            variables: new Map(),
          };
          await this.executeStatements(timer.body, context);
        }, duration * 1000);
      } else if (timer.type === "DailyTimerDecl") {
        const [hours, minutes] = timer.time.value.split(":").map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        const delay = scheduledTime.getTime() - now.getTime();
        setTimeout(async () => {
          const context: ExecutionContext = {
            user: this.client.user,
            channel: null,
            server: null,
            variables: new Map(),
          };
          await this.executeStatements(timer.body, context);
          // Schedule for next day
          setInterval(async () => {
            const dailyContext: ExecutionContext = {
              user: this.client.user,
              channel: null,
              server: null,
              variables: new Map(),
            };
            await this.executeStatements(timer.body, dailyContext);
          }, 24 * 60 * 60 * 1000);
        }, delay);
      }
    }

    for (const handler of handlers) {
      switch (handler.type) {
        case "ReadyHandler":
          this.client.once("clientReady", async () => {
            console.log(`Bot ${this.botName} is online!`);
            // Register slash commands
            await this.registerSlashCommands();
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

            // Extract args from message content
            const args = message.content
              .slice(this.prefix.length + handler.command.length)
              .trim()
              .split(/\s+/)
              .filter(arg => arg.length > 0);

            const context: ExecutionContext = {
              user: message.author,
              channel: message.channel,
              server: message.guild,
              message,
              target: message.mentions.members?.first(),
              args,
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

        case "ReactionRemoveHandler":
          this.client.on("messageReactionRemove", async (reaction, user) => {
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

        case "GuildMemberUpdateHandler":
          this.client.on("guildMemberUpdate", async (oldMember, newMember) => {
            const context: ExecutionContext = {
              user: newMember.user,
              channel: newMember.guild.systemChannel,
              server: newMember.guild,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "PresenceUpdateHandler":
          this.client.on("presenceUpdate", async (oldPresence, newPresence) => {
            const context: ExecutionContext = {
              user: newPresence.user,
              channel: newPresence.guild?.systemChannel,
              server: newPresence.guild,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "SlashCommandHandler":
          this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.commandName !== handler.command) return;

            const context: ExecutionContext = {
              user: interaction.user,
              channel: interaction.channel,
              server: interaction.guild,
              message: null,
              args: [],
              interaction,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "ButtonClickHandler":
          this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isButton()) return;
            if (interaction.customId !== handler.buttonId.value) return;

            const context: ExecutionContext = {
              user: interaction.user,
              channel: interaction.channel,
              server: interaction.guild,
              message: null,
              interaction,
              variables: new Map(),
            };
            await this.executeStatements(handler.body, context);
          });
          break;

        case "SelectMenuHandler":
          this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isStringSelectMenu()) return;
            if (interaction.customId !== handler.menuId.value) return;

            try {
              const context: ExecutionContext = {
                user: interaction.user,
                channel: interaction.channel,
                server: interaction.guild,
                message: null,
                values: interaction.values,
                interaction,
                variables: new Map(),
              };
              await this.executeStatements(handler.body, context);
            } catch (error) {
              console.error("Error in select menu handler:", error);
            }
          });
          break;

        case "ModalSubmitHandler":
          this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isModalSubmit()) return;
            if (interaction.customId !== handler.modalId.value) return;

            try {
              const context: ExecutionContext = {
                user: interaction.user,
                channel: interaction.channel,
                server: interaction.guild,
                message: null,
                fields: interaction.fields,
                interaction,
                variables: new Map(),
              };
              await this.executeStatements(handler.body, context);
            } catch (error) {
              console.error("Error in modal submit handler:", error);
            }
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
          if (context.interaction) {
            // For select menu interactions, send a regular message to the channel
            if (context.interaction.isStringSelectMenu()) {
              await context.channel?.send(replyText);
            } else {
              if (!context.interaction.replied && !context.interaction.deferred) {
                if (stmt.ephemeral) {
                  await context.interaction.reply({ content: replyText, ephemeral: true });
                } else {
                  await context.interaction.reply(replyText);
                }
              }
            }
          } else {
            await context.message?.reply(replyText);
          }
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
          try {
            if (context.interaction) {
              await context.interaction.reply({
                content: compMessage,
                components: components
              });
            } else {
              await context.channel?.send({
                content: compMessage,
                components: components
              });
            }
          } catch (error) {
            console.error("Error sending components:", error);
            throw error;
          }
          break;

        case "ShowModalStatement":
          if (!context.interaction) {
            console.error("Cannot show modal without interaction context");
            return;
          }
          const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import("discord.js");
          const modalInputs = stmt.inputs.map((input: any) => {
            const style = input.style?.value === "paragraph" ? TextInputStyle.Paragraph : TextInputStyle.Short;
            return new TextInputBuilder()
              .setCustomId(input.id.value)
              .setLabel(input.label.value)
              .setStyle(style)
              .setRequired(input.required);
          });
          const modal = new ModalBuilder()
            .setCustomId(stmt.modalId.value)
            .setTitle(stmt.title.value)
            .addComponents(modalInputs);
          try {
            await context.interaction.showModal(modal);
          } catch (error) {
            console.error("Error showing modal:", error);
          }
          break;

        case "LetDecl":
          const value = await this.evaluateExpression(stmt.value, context);
          context.variables.set(stmt.name, value);
          break;

        case "RequireRoleStatement":
          const requiredRole = this.findRole(context.server, stmt.role.value);
          if (!requiredRole) {
            console.error(`Required role not found: ${stmt.role.value}`);
            if (context.message) {
              await context.message.reply(`Error: Role "${stmt.role.value}" not found on this server.`);
            } else if (context.interaction) {
              await context.interaction.reply({ content: `Error: Role "${stmt.role.value}" not found on this server.`, ephemeral: true });
            }
            return;
          }
          // Get the member object for the user
          let member;
          if (context.user.roles) {
            member = context.user;
          } else {
            try {
              member = await context.server.members.fetch(context.user.id);
            } catch (error) {
              console.error(`Failed to fetch member: ${error}`);
              const errorMsg = `You need the "${stmt.role.value}" role to use this command.`;
              if (context.message) {
                await context.message.reply(errorMsg);
              } else if (context.interaction) {
                await context.interaction.reply({ content: errorMsg, ephemeral: true });
              }
              return;
            }
          }
          if (!member.roles.cache.has(requiredRole.id)) {
            const errorMsg = `You need the "${stmt.role.value}" role to use this command.`;
            if (context.message) {
              await context.message.reply(errorMsg);
            } else if (context.interaction) {
              await context.interaction.reply({ content: errorMsg, ephemeral: true });
            }
            return;
          }
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

        case "PinStatement":
          const pinTarget = await this.evaluateExpression(stmt.target, context);
          await pinTarget?.pin();
          break;

        case "UnpinStatement":
          const unpinTarget = await this.evaluateExpression(stmt.target, context);
          await unpinTarget?.unpin();
          break;

        case "AddReactionStatement":
          const addReactionTarget = await this.evaluateExpression(stmt.target, context);
          await addReactionTarget?.react(stmt.emoji.value);
          break;

        case "RemoveReactionStatement":
          const removeReactionTarget = await this.evaluateExpression(stmt.target, context);
          await removeReactionTarget?.reactions?.remove(stmt.emoji.value, context.user);
          break;

        case "RemoveAllReactionsStatement":
          const removeAllReactionsTarget = await this.evaluateExpression(stmt.target, context);
          await removeAllReactionsTarget?.reactions?.removeAll();
          break;

        case "CreateChannelStatement":
          const channelName = stmt.name.value;
          const newChannel = await context.server?.channels.create({ name: channelName });
          break;

        case "DeleteChannelStatement":
          const deleteChannelTarget = await this.evaluateExpression(stmt.target, context);
          await deleteChannelTarget?.delete();
          break;

        case "EditChannelStatement":
          const editChannelTarget = await this.evaluateExpression(stmt.target, context);
          if (stmt.newName) {
            await editChannelTarget?.setName(stmt.newName.value);
          }
          break;

        case "CreateRoleStatement":
          const roleName = stmt.name.value;
          await context.server?.roles.create({ name: roleName });
          break;

        case "DeleteRoleStatement":
          const deleteRoleTarget = await this.evaluateExpression(stmt.target, context);
          await deleteRoleTarget?.delete();
          break;

        case "EditRoleStatement":
          const editRoleTarget = await this.evaluateExpression(stmt.target, context);
          if (stmt.newName) {
            await editRoleTarget?.setName(stmt.newName.value);
          }
          break;

        case "SendDMStatement":
          const dmTarget = await this.evaluateExpression(stmt.target, context);
          const dmMessage = await this.evaluateExpression(stmt.message, context);
          await dmTarget?.send(dmMessage);
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

        case "JoinVoiceStatement":
          const voiceTarget = await this.evaluateExpression(stmt.target, context);
          if (voiceTarget && voiceTarget.channel) {
            await this.joinVoiceChannel(voiceTarget.channel);
          }
          break;

        case "LeaveVoiceStatement":
          const leaveTarget = await this.evaluateExpression(stmt.target, context);
          if (leaveTarget && leaveTarget.channel) {
            await this.leaveVoiceChannel(leaveTarget.channel);
          }
          break;

        case "PlayAudioStatement":
          const audioUrl = await this.evaluateExpression(stmt.url, context);
          await this.playAudio(audioUrl);
          break;

        case "StopAudioStatement":
          await this.stopAudio();
          break;

        case "PauseAudioStatement":
          await this.pauseAudio();
          break;

        case "ResumeAudioStatement":
          await this.resumeAudio();
          break;

        case "SetVolumeStatement":
          const volume = await this.evaluateExpression(stmt.volume, context);
          await this.setVolume(volume);
          break;

        case "CreateWebhookStatement":
          const webhookName = await this.evaluateExpression(stmt.name, context);
          await this.createWebhook(webhookName, context);
          break;

        case "ExecuteWebhookStatement":
          const webhookUrl = await this.evaluateExpression(stmt.url, context);
          const webhookMessage = await this.evaluateExpression(stmt.message, context);
          await this.executeWebhook(webhookUrl, webhookMessage);
          break;

        case "EditWebhookStatement":
          const editWebhookUrl = await this.evaluateExpression(stmt.url, context);
          const editWebhookMessage = await this.evaluateExpression(stmt.message, context);
          await this.editWebhook(editWebhookUrl, editWebhookMessage);
          break;

        case "DeleteWebhookStatement":
          const deleteWebhookUrl = await this.evaluateExpression(stmt.url, context);
          await this.deleteWebhook(deleteWebhookUrl);
          break;

        case "CreateThreadStatement":
          const threadName = await this.evaluateExpression(stmt.name, context);
          await this.createThread(threadName, context);
          break;

        case "ArchiveThreadStatement":
          const archiveTarget = await this.evaluateExpression(stmt.target, context);
          await this.archiveThread(archiveTarget);
          break;

        case "LockThreadStatement":
          const lockTarget = await this.evaluateExpression(stmt.target, context);
          await this.lockThread(lockTarget);
          break;

        case "UnlockThreadStatement":
          const unlockTarget = await this.evaluateExpression(stmt.target, context);
          await this.unlockThread(unlockTarget);
          break;

        case "SubcommandGroupStatement":
          await this.executeSubcommandGroup(stmt, context);
          break;

        case "PushStatement":
          const pushValue = await this.evaluateExpression(stmt.value, context);
          const pushNamespace = await this.evaluateExpression(stmt.namespace, context);
          this.pushToArray(pushNamespace, stmt.key, pushValue);
          break;

        case "RandomPickStatement":
          const randomNamespace = await this.evaluateExpression(stmt.namespace, context);
          const randomPick = this.randomFromArray(randomNamespace, stmt.key);
          context.variables.set("_randomPick", randomPick);
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

        case "UnbanStatement":
          const unbanSubject = await this.evaluateExpression(stmt.subject, context);
          if (unbanSubject) {
            await context.server?.members.unban(unbanSubject);
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
            // Handle array indexing like values[0]
            const arrayMatch = path.match(/^(\w+)\[(\d+)\]$/);
            if (arrayMatch) {
              const [, arrayName, index] = arrayMatch;
              let value: any;
              if (context.variables.has(arrayName)) {
                value = context.variables.get(arrayName);
              } else {
                value = (context as any)[arrayName];
              }
              return value !== undefined && value !== null ? String(value[parseInt(index)]) : match;
            }

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
        const getUserId = await this.evaluateExpression(expr.userId, context);
        return await this.client.users.fetch(getUserId);

      case "GetGuildExpr":
        const guildId = await this.evaluateExpression(expr.guildId, context);
        return await this.client.guilds.fetch(guildId);

      case "RandomExpr":
        const min = expr.min ? await this.evaluateExpression(expr.min, context) : 0;
        const max = expr.max ? await this.evaluateExpression(expr.max, context) : 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;

      case "GetReactionUsersExpr":
        const messageId = await this.evaluateExpression(expr.messageId, context);
        const emoji = await this.evaluateExpression(expr.emoji, context);
        try {
          const message = await context.channel?.messages.fetch(messageId);
          const reaction = message?.reactions.cache.get(emoji);
          if (!reaction) return [];
          const users = await reaction.users.fetch();
          return users.filter((u: any) => !u.bot).map((u: any) => u.id);
        } catch (error) {
          console.error("Error fetching reaction users:", error);
          return [];
        }

      case "ArrayLiteral":
        const elements = await Promise.all(
          expr.elements.map((el) => this.evaluateExpression(el, context))
        );
        return elements;

      case "ObjectLiteral":
        const obj: any = {};
        for (const prop of expr.properties) {
          const value = await this.evaluateExpression(prop.value, context);
          obj[prop.key] = value;
        }
        return obj;

      case "StringMethodExpr":
        const target = await this.evaluateExpression(expr.target, context);
        const str = String(target);
        switch (expr.method) {
          case "uppercase":
            return str.toUpperCase();
          case "lowercase":
            return str.toLowerCase();
          case "split":
            const separator = expr.args ? await this.evaluateExpression(expr.args[0], context) : " ";
            return str.split(separator);
          case "trim":
            return str.trim();
          default:
            throw new Error(`Unknown string method: ${expr.method}`);
        }

      case "ArrayLengthExpr":
        const arrayTarget = await this.evaluateExpression(expr.target, context);
        if (Array.isArray(arrayTarget)) {
          return arrayTarget.length;
        }
        throw new Error("length of can only be used with arrays");

      case "ArrayAccessExpr":
        const array = await this.evaluateExpression(expr.target, context);
        if (!Array.isArray(array)) {
          throw new Error(`Cannot access array index on non-array value`);
        }
        if (typeof expr.index === "string") {
          switch (expr.index) {
            case "first":
              return array[0];
            case "second":
              return array[1];
            case "third":
              return array[2];
            case "last":
              return array[array.length - 1];
            default:
              throw new Error(`Unknown array index keyword: ${expr.index}`);
          }
        } else {
          const index = await this.evaluateExpression(expr.index, context);
          return array[index];
        }

      case "FindRoleExpr":
        const roleName = await this.evaluateExpression(expr.roleName, context);
        return this.findRole(context.server, roleName);

      case "FindChannelExpr":
        const channelName = await this.evaluateExpression(expr.channelName, context);
        return this.findChannel(context.server, channelName);

      case "FindUserExpr":
        const findUserId = await this.evaluateExpression(expr.userId, context);
        return await this.client.users.fetch(findUserId);

      case "ReplyExpr":
        const replyText = await this.evaluateExpression(expr.message, context);
        let sentMessage;
        if (context.interaction) {
          if (!context.interaction.replied && !context.interaction.deferred) {
            if (expr.ephemeral) {
              sentMessage = await context.interaction.reply({ content: replyText, ephemeral: true });
              sentMessage = await sentMessage.fetch();
            } else {
              sentMessage = await context.interaction.reply({ content: replyText });
              sentMessage = await sentMessage.fetch();
            }
          } else {
            sentMessage = await context.channel?.send(replyText);
          }
        } else {
          sentMessage = await context.message?.reply(replyText);
        }
        return sentMessage;

      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  private parseDuration(duration: DurationLiteral | string): number {
    let value: number;
    let unit: string;

    if (typeof duration === "string") {
      value = 1;
      unit = duration;
    } else {
      value = duration.amount.value;
      unit = duration.unit;
    }

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

  private async joinVoiceChannel(channel: any): Promise<void> {
    if (!channel || !channel.isVoiceBased()) {
      throw new Error("Target must be a voice channel");
    }
    
    const guildId = channel.guildId;
    const state = this.voiceState.get(guildId);
    
    if (state && state.connection) {
      throw new Error("Already connected to a voice channel in this server");
    }
    
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    
    const player = createAudioPlayer();
    connection.subscribe(player);
    
    this.voiceState.set(guildId, {
      connection,
      player,
      queue: [],
      volume: 1.0,
    });
  }

  private async leaveVoiceChannel(channel: any): Promise<void> {
    if (!channel || !channel.guildId) {
      throw new Error("Invalid channel");
    }
    
    const guildId = channel.guildId;
    const state = this.voiceState.get(guildId);
    
    if (!state || !state.connection) {
      throw new Error("Not connected to a voice channel in this server");
    }
    
    state.player.stop();
    state.connection.destroy();
    this.voiceState.delete(guildId);
  }

  private async playAudio(url: string): Promise<void> {
    // Find the first active voice connection
    for (const [guildId, state] of this.voiceState) {
      if (state.connection && state.player) {
        const resource = createAudioResource(url);
        state.player.play(resource);
        return;
      }
    }
    throw new Error("Not connected to any voice channel");
  }

  private async stopAudio(): Promise<void> {
    for (const [guildId, state] of this.voiceState) {
      if (state.player) {
        state.player.stop();
      }
    }
  }

  private async pauseAudio(): Promise<void> {
    for (const [guildId, state] of this.voiceState) {
      if (state.player) {
        state.player.pause();
      }
    }
  }

  private async resumeAudio(): Promise<void> {
    for (const [guildId, state] of this.voiceState) {
      if (state.player) {
        state.player.unpause();
      }
    }
  }

  private async setVolume(volume: number): Promise<void> {
    const vol = Math.max(0, Math.min(1, volume));
    for (const [guildId, state] of this.voiceState) {
      state.volume = vol;
      // Volume would need to be applied to the audio resource
      // This is a simplified implementation
    }
  }

  private async createWebhook(name: string, context: ExecutionContext): Promise<void> {
    if (!context.channel) {
      throw new Error("No channel available to create webhook");
    }
    const webhook = await context.channel.createWebhook({ name });
    if (context.interaction) {
      await context.interaction.reply(`Webhook created: ${webhook.url}`);
    } else {
      await context.channel?.send(`Webhook created: ${webhook.url}`);
    }
  }

  private async executeWebhook(url: string, message: string): Promise<void> {
    const { WebhookClient } = require('discord.js');
    const webhook = new WebhookClient({ url });
    await webhook.send(message);
  }

  private async editWebhook(url: string, message: string): Promise<void> {
    const { WebhookClient } = require('discord.js');
    const webhook = new WebhookClient({ url });
    // For editing, we'd need the message ID, which isn't in the current syntax
    // This is a limitation of the current simple syntax
    throw new Error("Edit webhook requires message ID. Use execute webhook instead.");
  }

  private async deleteWebhook(url: string): Promise<void> {
    const { WebhookClient } = require('discord.js');
    const webhook = new WebhookClient({ url });
    await webhook.delete();
  }

  private async createThread(name: string, context: ExecutionContext): Promise<void> {
    if (!context.channel) {
      throw new Error("No channel available to create thread");
    }
    if (!context.message) {
      throw new Error("Threads require a message to start from");
    }
    const thread = await context.message.startThread({
      name,
      autoArchiveDuration: 1440, // 24 hours
    });
    if (context.interaction) {
      await context.interaction.reply(`Thread created: ${thread.name}`);
    } else {
      await context.channel?.send(`Thread created: ${thread.name}`);
    }
  }

  private async archiveThread(target: any): Promise<void> {
    if (target && target.setArchived) {
      await target.setArchived(true);
    } else {
      throw new Error("Invalid thread target for archiving");
    }
  }

  private async lockThread(target: any): Promise<void> {
    if (target && target.setLocked) {
      await target.setLocked(true);
    } else {
      throw new Error("Invalid thread target for locking");
    }
  }

  private async unlockThread(target: any): Promise<void> {
    if (target && target.setLocked) {
      await target.setLocked(false);
    } else {
      throw new Error("Invalid thread target for unlocking");
    }
  }

  private async executeSubcommandGroup(stmt: any, context: ExecutionContext): Promise<void> {
    // Subcommand groups are handled during command registration
    // This is a no-op in the interpreter as the actual subcommand handling
    // is done through the regular slash command handlers
    throw new Error("Subcommand groups are registered during bot startup. Use individual slash handlers for subcommands.");
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
    if (embed.author) built.setAuthor({ name: embed.author.value });
    if (embed.footer) built.setFooter({ text: embed.footer.value });
    if (embed.image) built.setImage(embed.image.value);
    if (embed.thumbnail) built.setThumbnail(embed.thumbnail.value);
    if (embed.url) built.setURL(embed.url.value);
    if (embed.timestamp) built.setTimestamp();
    
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
        let button = new ButtonBuilder()
          .setLabel(comp.label?.value || "Button");
        
        if (comp.url) {
          button = button.setStyle(ButtonStyle.Link).setURL(comp.url.value);
          // Link buttons don't have customId
        } else {
          button = button.setCustomId(comp.id.value);
          if (comp.style) {
            const styleValue = comp.style.value.toLowerCase();
            const styleMap: Record<string, any> = {
              primary: ButtonStyle.Primary,
              secondary: ButtonStyle.Secondary,
              success: ButtonStyle.Success,
              danger: ButtonStyle.Danger,
              link: ButtonStyle.Link
            };
            button = button.setStyle(styleMap[styleValue] || ButtonStyle.Primary);
          } else {
            button = button.setStyle(ButtonStyle.Primary);
          }
        }
        
        const row = new ActionRowBuilder().addComponents(button);
        rows.push(row);
      } else if (comp.type === "SelectMenuComponent") {
        let menu: any;
        const menuType = comp.menuType?.value?.toLowerCase() || "string";
        
        if (menuType === "channel") {
          menu = new ChannelSelectMenuBuilder().setCustomId(comp.id.value);
        } else if (menuType === "role") {
          menu = new RoleSelectMenuBuilder().setCustomId(comp.id.value);
        } else if (menuType === "user") {
          menu = new UserSelectMenuBuilder().setCustomId(comp.id.value);
        } else if (menuType === "mentionable") {
          menu = new MentionableSelectMenuBuilder().setCustomId(comp.id.value);
        } else {
          const options = comp.options?.map((opt: any) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(opt.label?.value || "Option")
              .setValue(opt.value?.value || "value")
          ) || [];

          menu = new StringSelectMenuBuilder()
            .setCustomId(comp.id.value)
            .setPlaceholder("Select an option")
            .setOptions(options);
        }

        const row = new ActionRowBuilder().addComponents(menu);
        rows.push(row);
      }
    }
    
    return rows;
  }

  private async registerSlashCommands(): Promise<void> {
    const slashHandlers = this.program.body.filter(
      (node): node is any => node.type === "SlashCommandHandler"
    );

    if (slashHandlers.length === 0) return;

    const commands = slashHandlers.map((handler) => ({
      name: handler.command,
      description: handler.description?.value || "No description",
      options: handler.options?.map((opt: any) => ({
        name: opt.name,
        description: opt.description.value,
        type: this.mapOptionType(opt.optionType),
        required: opt.required.value,
      })) || [],
    }));

    try {
      // Register commands globally (takes up to 1 hour to propagate)
      // For testing, you might want to register to a specific guild instead
      // await this.client.application?.commands.set(commands);
      
      // For faster testing, register to the first guild the bot is in
      const guild = this.client.guilds.cache.first();
      if (guild) {
        await guild.commands.set(commands);
        console.log(`Registered ${commands.length} slash commands to guild: ${guild.name}`);
      } else {
        console.log("No guilds found, skipping slash command registration");
      }
    } catch (error) {
      console.error("Failed to register slash commands:", error);
    }
  }

  private mapOptionType(type: string): number {
    const typeMap: Record<string, number> = {
      "string": 3,
      "integer": 4,
      "boolean": 5,
      "user": 6,
      "channel": 7,
      "role": 8,
      "mentionable": 9,
      "number": 10,
    };
    return typeMap[type] || 3; // Default to string
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

  private pushToArray(namespace: string, key: string, value: any): void {
    let current = this.loadValue(namespace, key, []);
    if (!Array.isArray(current)) {
      current = [];
    }
    current.push(value);
    this.saveValue(namespace, key, current);
  }

  private randomFromArray(namespace: string, key: string): any {
    const current = this.loadValue(namespace, key, []);
    if (!Array.isArray(current) || current.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * current.length);
    return current[randomIndex];
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
      const envVarName = tokenDecl.value.value;
      const envToken = process.env[envVarName];
      
      if (envToken) {
        // Use environment variable
        await this.client.login(envToken);
      } else {
        // Fall back to saved CLI token with deprecation warning
        console.warn(`Warning: ${envVarName} is not set. Falling back to token saved by \`newt token\`.`);
        console.warn(`This fallback is deprecated; set ${envVarName} instead.`);
        await this.client.login(this.token);
      }
    } else {
      // Use the literal token value from the .newt file
      await this.client.login(tokenDecl?.value.value || "");
    }
  }
}
