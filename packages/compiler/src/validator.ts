import type {
  BotDecl,
  Expression,
  Handler,
  Program,
  Statement,
  TimerDecl,
  TopLevelNode
} from "./ast.js";
import { makeCatalogError, type NewtError } from "./errors.js";

const builtIns = new Set([
  // Fix #17: Added user.username to match docs (docs showed user.username, validator only had user.name).
  // Both are now accepted; user.name is kept for backwards compatibility.
  "user.name",
  "user.username",
  "user.id",
  "user.mention",
  "message.content",
  "channel.name",
  "server.name",
  "server.id",
  "server.members",
  "args",
  "target",
  "target.id",
  "target.username",
]);

export function validate(program: Program, source = ""): NewtError[] {
  const validator = new Validator(source);
  return validator.validate(program);
}

class Validator {
  private readonly errors: NewtError[] = [];
  private hasBotName = false;
  private hasBotToken = false;

  constructor(private readonly source: string) {}

  validate(program: Program): NewtError[] {
    for (const node of program.body) {
      this.visitTopLevel(node);
    }

    if (!this.hasBotName) {
      this.errors.push(makeCatalogError("NEWT_E008", 1, 1, this.line(1)));
    }
    if (!this.hasBotToken) {
      this.errors.push(makeCatalogError("NEWT_E009", 1, 1, this.line(1)));
    }

    return this.errors;
  }

  private visitTopLevel(node: TopLevelNode): void {
    switch (node.type) {
      case "BotDecl": {
        this.visitBotDecl(node);
        return;
      }

      case "EveryTimerDecl":
      case "DailyTimerDecl": {
        this.visitTimer(node);
        return;
      }

      // Fix #1: Removed the duplicate SlashCommandHandler case that was previously
      // copy-pasted below ButtonClickHandler/SelectMenuHandler. The second occurrence
      // was unreachable dead code because the first already returned.
      case "SlashCommandHandler": {
        if (node.options) {
          for (const option of node.options) {
            this.visitExpression(option.description, new Set(), false);
          }
        }
        if (node.description) {
          this.visitExpression(node.description, new Set(), false);
        }
        const slashScope = new Set(["user", "channel", "server", "args", "interaction"]);
        this.visitStatements(node.body, slashScope);
        return;
      }

      case "ButtonClickHandler":
      case "SelectMenuHandler": {
        const interactionScope = new Set(["user", "channel", "server", "interaction", "values"]);
        this.visitStatements(node.body, interactionScope);
        return;
      }

      // Fix #9: ModalSubmitHandler now gets its own case with a proper scope that
      // includes user, channel, server, interaction, and fields. Previously it fell
      // through to the default branch which used an empty scope, causing false
      // "variable not defined" validation errors inside modal submit handlers.
      case "ModalSubmitHandler": {
        const modalScope = new Set(["user", "channel", "server", "interaction", "fields"]);
        this.visitStatements(node.body, modalScope);
        return;
      }

      case "MessageUpdateHandler":
      case "MessageDeleteHandler": {
        const messageScope = new Set(["user", "channel", "server", "message"]);
        this.visitStatements(node.body, messageScope);
        return;
      }

      default: {
        // ReadyHandler, CommandHandler, JoinHandler, LeaveHandler, ReactionAddHandler,
        // ReactionRemoveHandler, GuildMemberUpdateHandler, PresenceUpdateHandler, etc.
        // all seed a reasonable base scope.
        const defaultScope = new Set(["user", "channel", "server", "message", "member", "target", "args"]);
        this.visitStatements(node.body, defaultScope);
      }
    }
  }

  private visitBotDecl(node: BotDecl): void {
    if (node.kind === "name") {
      this.hasBotName = true;
    }
    if (node.kind === "token") {
      this.hasBotToken = true;
      if (!node.fromEnv) {
        this.errors.push(makeCatalogError("NEWT_E005", node.loc.line, node.loc.column, this.line(node.loc.line)));
      }
    }
  }

  private visitTimer(node: TimerDecl): void {
    if (node.type === "EveryTimerDecl" && node.amount.value <= 0) {
      this.errors.push(makeCatalogError("NEWT_E014", node.loc.line, node.loc.column, this.line(node.loc.line)));
    }
    this.visitStatements(node.body, new Set());
  }

  private visitStatements(statements: Statement[], scope: Set<string>, inTry = false): void {
    for (const statement of statements) {
      switch (statement.type) {
        case "LetDecl":
          this.visitExpression(statement.value, scope, inTry);
          scope.add(statement.name);
          break;
        case "ReplyStatement":
        case "SayStatement":
        case "ExpressionStatement":
          this.visitExpression("message" in statement ? statement.message : (statement as any).expression, scope, inTry);
          break;
        case "SayEmbedStatement":
          if (statement.embed.title) this.visitExpression(statement.embed.title, scope, inTry);
          if (statement.embed.description) this.visitExpression(statement.embed.description, scope, inTry);
          for (const field of statement.embed.fields) {
            this.visitExpression(field.name, scope, inTry);
            this.visitExpression(field.value, scope, inTry);
          }
          break;
        case "StoreStatement":
          this.visitExpression(statement.namespace, scope, inTry);
          this.visitExpression(statement.value, scope, inTry);
          break;
        case "IfStatement":
          this.visitExpression(statement.condition, scope, inTry);
          this.visitStatements(statement.consequent, new Set(scope), inTry);
          this.visitStatements(statement.alternate, new Set(scope), inTry);
          break;
        case "ForEachStatement":
          this.visitExpression(statement.iterable, scope, inTry);
          this.visitStatements(statement.body, new Set([...scope, statement.itemName]), inTry);
          break;
        case "RequireRoleStatement":
        case "GiveRoleStatement":
        case "RemoveRoleStatement":
          if ("role" in statement && (statement as any).role.value.length === 0) {
            this.errors.push(makeCatalogError("NEWT_E015", statement.loc.line, statement.loc.column, this.line(statement.loc.line)));
          }
          if ("subject" in statement) this.visitExpression((statement as any).subject, scope, inTry);
          break;
        case "MuteStatement":
        case "KickStatement":
        case "BanStatement":
          this.visitExpression(statement.subject, scope, inTry);
          break;
        case "EditMessageStatement":
          this.visitExpression(statement.target, scope, inTry);
          this.visitExpression(statement.newContent, scope, inTry);
          break;
        case "DeleteMessageStatement":
          this.visitExpression(statement.target, scope, inTry);
          break;
        case "UploadStatement":
          this.visitExpression(statement.filePath, scope, inTry);
          if (statement.message) this.visitExpression(statement.message, scope, inTry);
          break;
        case "SetActivityStatement":
          this.visitExpression(statement.activity, scope, inTry);
          break;
        case "TryCatchStatement":
          this.visitStatements(statement.body, new Set(scope), true);
          this.visitStatements(statement.errorHandler, new Set(scope), true);
          break;
        case "WaitStatement":
          if (statement.duration.amount.value <= 0) {
            this.errors.push(makeCatalogError("NEWT_E014", statement.loc.line, statement.loc.column, this.line(statement.loc.line)));
          }
          break;
        default:
          break;
      }
    }
  }

  private visitExpression(expression: Expression, scope: Set<string>, inTry: boolean): void {
    switch (expression.type) {
      case "IdentifierExpr":
        if (
          !scope.has(expression.name) &&
          !["user", "message", "channel", "server", "args", "target", "member", "current", "interaction", "values", "fields"].includes(expression.name)
        ) {
          this.errors.push(makeCatalogError("NEWT_E007", expression.loc.line, expression.loc.column, this.line(expression.loc.line), {
            length: expression.name.length
          }));
        }
        break;
      case "MemberExpr": {
        const path = expression.path.join(".");
        const isKnown =
          builtIns.has(path) ||
          scope.has(expression.path[0] ?? "") ||
          ["member", "interaction", "fields", "values"].includes(expression.path[0] ?? "");
        if (!isKnown) {
          this.errors.push(makeCatalogError("NEWT_E013", expression.loc.line, expression.loc.column, this.line(expression.loc.line), {
            length: path.length
          }));
        }
        break;
      }
      case "LoadExpr":
        this.visitExpression(expression.namespace, scope, inTry);
        if (expression.fallback) this.visitExpression(expression.fallback, scope, inTry);
        break;
      case "FetchExpr":
        if (!inTry) {
          this.errors.push(makeCatalogError("NEWT_E011", expression.loc.line, expression.loc.column, this.line(expression.loc.line)));
        }
        this.visitExpression(expression.url, scope, inTry);
        break;
      case "GetUserExpr":
        if (!inTry) {
          this.errors.push(makeCatalogError("NEWT_E011", expression.loc.line, expression.loc.column, this.line(expression.loc.line)));
        }
        this.visitExpression(expression.userId, scope, inTry);
        break;
      case "GetGuildExpr":
        if (!inTry) {
          this.errors.push(makeCatalogError("NEWT_E011", expression.loc.line, expression.loc.column, this.line(expression.loc.line)));
        }
        this.visitExpression(expression.guildId, scope, inTry);
        break;
      case "RandomExpr":
        if (expression.min) this.visitExpression(expression.min, scope, inTry);
        if (expression.max) this.visitExpression(expression.max, scope, inTry);
        break;
      case "GetReactionUsersExpr":
        if (!inTry) {
          this.errors.push(makeCatalogError("NEWT_E011", expression.loc.line, expression.loc.column, this.line(expression.loc.line)));
        }
        this.visitExpression(expression.messageId, scope, inTry);
        this.visitExpression(expression.emoji, scope, inTry);
        break;
      case "BinaryExpr":
        this.visitExpression(expression.left, scope, inTry);
        this.visitExpression(expression.right, scope, inTry);
        break;
      case "UnaryExpr":
        this.visitExpression(expression.argument, scope, inTry);
        break;
      case "CallExpr":
        for (const arg of expression.args) this.visitExpression(arg, scope, inTry);
        break;
      default:
        break;
    }
  }

  private line(line: number): string {
    return this.source.split(/\r?\n/)[line - 1] ?? "";
  }
}
