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
  "user.name",
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
  "target.username"
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

      // Handle new handler types
      case "SlashCommandHandler": {
        if (node.options) {
          for (const option of node.options) {
            this.visitExpression(option.description, new Set(), false);
          }
        }
        if (node.description) {
          this.visitExpression(node.description, new Set(), false);
        }
        // Add built-in variables for slash commands
        const slashScope = new Set(["user", "channel", "server", "args", "interaction"]);
        this.visitStatements(node.body, slashScope);
        return;
      }

      case "ButtonClickHandler":
      case "SelectMenuHandler": {
        // Add built-in variables for interactions
        const interactionScope = new Set(["user", "channel", "server", "interaction", "values"]);
        this.visitStatements(node.body, interactionScope);
        return;
      }

      default: {
        this.visitStatements(node.body, new Set());
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
          this.visitExpression("message" in statement ? statement.message : statement.expression, scope, inTry);
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
          if ("role" in statement && statement.role.value.length === 0) {
            this.errors.push(makeCatalogError("NEWT_E015", statement.loc.line, statement.loc.column, this.line(statement.loc.line)));
          }
          if ("subject" in statement) this.visitExpression(statement.subject, scope, inTry);
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
        if (!scope.has(expression.name) && !["user", "message", "channel", "server", "args", "target", "member", "current"].includes(expression.name)) {
          this.errors.push(makeCatalogError("NEWT_E007", expression.loc.line, expression.loc.column, this.line(expression.loc.line), {
            length: expression.name.length
          }));
        }
        break;
      case "MemberExpr": {
        const path = expression.path.join(".");
        const isKnown = builtIns.has(path) || scope.has(expression.path[0] ?? "") || expression.path[0] === "member";
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
