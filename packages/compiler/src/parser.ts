import type {
  BinaryExpr,
  BotDecl,
  CommandHandler,
  DailyTimerDecl,
  DurationLiteral,
  EmbedBlock,
  EveryTimerDecl,
  Expression,
  Handler,
  SlashOption,
  MessageContainsHandler,
  Program,
  Statement,
  StringLiteral,
  TimeUnit,
  TopLevelNode,
  Component,
  SelectOption
} from "./ast.js";
import { makeCatalogError, NewtError } from "./errors.js";
import type { Token, TokenType } from "./lexer.js";

export function parse(tokens: Token[]): Program {
  return new Parser(tokens).parseProgram();
}

class Parser {
  private current = 0;

  constructor(private readonly tokens: Token[]) {}

  parseProgram(): Program {
    const body: TopLevelNode[] = [];
    this.skipNewlines();

    while (!this.isAtEnd()) {
      if (this.checkKeyword("bot")) {
        body.push(this.parseBotDecl());
      } else if (this.checkKeyword("on")) {
        body.push(this.parseHandler());
      } else if (this.checkKeyword("every") || this.checkKeyword("at")) {
        body.push(this.parseTimer());
      } else {
        const token = this.peek();
        throw makeCatalogError("NEWT_E004", token.line, token.column, this.sourceLineHint(token));
      }
      this.skipNewlines();
    }

    return { type: "Program", loc: { line: 1, column: 1 }, body };
  }

  private parseBotDecl(): BotDecl {
    const start = this.consumeKeyword("bot");
    const kindToken = this.consumeType("KEYWORD", "Bot declarations need a setting like name, prefix, or token.");
    if (!["name", "prefix", "token"].includes(kindToken.value)) {
      throw this.error(kindToken, "Bot declarations support name, prefix, and token.");
    }

    let fromEnv = false;
    if (kindToken.value === "token" && this.matchKeyword("from")) {
      this.consumeKeyword("env");
      fromEnv = true;
    }

    const value = this.parseStringLiteral();
    this.consumeLineEnd();

    return {
      type: "BotDecl",
      loc: this.loc(start),
      kind: kindToken.value as BotDecl["kind"],
      value,
      fromEnv
    };
  }

  private parseHandler(): Handler {
    const start = this.consumeKeyword("on");
    const event = this.consumeType("KEYWORD", "Handlers need an event name after on.");

    let handler: Handler;

    switch (event.value) {
      case "ready": {
        handler = { type: "ReadyHandler", loc: this.loc(start), body: [] };
        break;
      }
      case "command": {
        const command = this.parseStringLiteral();
        handler = { type: "CommandHandler", loc: this.loc(start), command: command.value, body: [] };
        break;
      }
      case "message": {
        this.consumeKeyword("contains");
        const needle = this.parseStringLiteral();
        handler = { type: "MessageContainsHandler", loc: this.loc(start), needle, body: [] };
        break;
      }
      case "join": {
        handler = { type: "JoinHandler", loc: this.loc(start), body: [] };
        break;
      }
      case "leave": {
        handler = { type: "LeaveHandler", loc: this.loc(start), body: [] };
        break;
      }
      case "reaction": {
        this.consumeKeyword("add");
        const emoji = this.parseStringLiteral();
        handler = { type: "ReactionAddHandler", loc: this.loc(start), emoji, body: [] };
        break;
      }
      case "slash": {
        const command = this.parseStringLiteral();
        let description: StringLiteral | undefined;
        let options: SlashOption[] | undefined;

        if (this.matchKeyword("description")) {
          description = this.parseStringLiteral();
        }

        if (this.matchKeyword("with")) {
          this.consumeKeyword("options");
          options = [];
          while (this.check("IDENTIFIER")) {
            const name = this.consumeType("IDENTIFIER", "Expected option name").value;
            this.consumeKeyword("as");
            const optionType = this.consumeType("IDENTIFIER", "Expected option type").value;
            this.consumeKeyword("description");
            const optDescription = this.parseStringLiteral();
            const required = this.matchKeyword("required") ?
              { type: "BooleanLiteral" as const, loc: this.loc(start), value: true } :
              { type: "BooleanLiteral" as const, loc: this.loc(start), value: false };

            options.push({
              type: "SlashOption",
              loc: this.loc(start),
              name,
              description: optDescription,
              required,
              optionType: optionType as any
            });
          }
        }

        handler = { type: "SlashCommandHandler", loc: this.loc(start), command: command.value, description, options, body: [] };
        break;
      }
      case "button": {
        this.consumeKeyword("click");
        const buttonId = this.parseStringLiteral();
        handler = { type: "ButtonClickHandler", loc: this.loc(start), buttonId, body: [] };
        break;
      }
      case "select": {
        this.consumeKeyword("menu");
        const menuId = this.parseStringLiteral();
        handler = { type: "SelectMenuHandler", loc: this.loc(start), menuId, body: [] };
        break;
      }
      default: {
        throw makeCatalogError("NEWT_E003", event.line, event.column, this.sourceLineHint(event));
      }
    }

    this.consumeBlockStart();
    handler.body = this.parseBlock();
    return handler;
  }

  private parseTimer(): EveryTimerDecl | DailyTimerDecl {
    if (this.checkKeyword("every")) {
      const start = this.advance();
      const amount = this.parseNumberLiteral();
      const unit = this.consumeType("KEYWORD", "Timers need a unit like seconds, minutes, or hours.");
      this.consumeBlockStart();
      return {
        type: "EveryTimerDecl",
        loc: this.loc(start),
        amount,
        unit: unit.value as TimeUnit,
        body: this.parseBlock()
      };
    }

    const start = this.consumeKeyword("at");
    const time = this.parseStringLiteral();
    this.consumeKeyword("daily");
    this.consumeBlockStart();
    return { type: "DailyTimerDecl", loc: this.loc(start), time, body: this.parseBlock() };
  }

  private parseBlock(): Statement[] {
    this.skipNewlines();
    this.consumeType("INDENT", "Indented lines should come after a block header.");
    const body: Statement[] = [];
    this.skipNewlines();

    while (!this.isAtEnd() && !this.check("DEDENT")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    this.consumeType("DEDENT", "Blocks need to return to the previous indentation level.");
    return body;
  }

  private parseStatement(): Statement {
    if (this.checkKeyword("reply")) {
      const start = this.advance();
      const message = this.parseExpressionUntilLineEnd();
      this.consumeLineEnd();
      return { type: "ReplyStatement", loc: this.loc(start), message };
    }

    if (this.checkKeyword("say")) {
      return this.parseSayStatement();
    }

    if (this.checkKeyword("let")) {
      const start = this.advance();
      const name = this.consumeType("IDENTIFIER", "let needs a variable name.").value;
      this.consumeType("EQUALS", "let needs an equals sign before the value.");
      const value = this.parseExpressionUntilLineEnd();
      this.consumeLineEnd();
      return { type: "LetDecl", loc: this.loc(start), name, value };
    }

    if (this.checkKeyword("store")) {
      const start = this.advance();
      const namespace = this.parseAtom();
      const key = this.consumeWord("store needs a key name after the namespace.").value;
      this.consumeType("EQUALS", "store needs an equals sign before the value.");
      const value = this.parseExpressionUntilLineEnd();
      this.consumeLineEnd();
      return { type: "StoreStatement", loc: this.loc(start), namespace, key, value };
    }

    if (this.checkKeyword("if")) {
      return this.parseIfStatement();
    }

    if (this.checkKeyword("for")) {
      return this.parseForEachStatement();
    }

    if (this.checkKeyword("require")) {
      const start = this.advance();
      this.consumeKeyword("role");
      const role = this.parseStringLiteral();
      this.consumeLineEnd();
      return { type: "RequireRoleStatement", loc: this.loc(start), role };
    }

    if (this.checkKeyword("give") || this.checkKeyword("remove")) {
      return this.parseRoleMutation();
    }

    if (this.checkKeyword("mute")) {
      const start = this.advance();
      const subject = this.parseAtom();
      let duration: DurationLiteral | undefined;
      if (this.matchKeyword("for")) {
        duration = this.parseDuration();
      }
      this.consumeLineEnd();
      return { type: "MuteStatement", loc: this.loc(start), subject, duration };
    }

    if (this.checkKeyword("kick") || this.checkKeyword("ban")) {
      const start = this.advance();
      const subject = this.parseAtom();
      this.consumeLineEnd();
      return { type: start.value === "kick" ? "KickStatement" : "BanStatement", loc: this.loc(start), subject };
    }

    if (this.checkKeyword("try")) {
      return this.parseTryCatch();
    }

    if (this.checkKeyword("wait")) {
      const start = this.advance();
      this.consumeKeyword("for");
      const duration = this.parseDuration();
      this.consumeLineEnd();
      return { type: "WaitStatement", loc: this.loc(start), duration };
    }

    const start = this.peek();
    const expression = this.parseExpressionUntilLineEnd();
    this.consumeLineEnd();
    return { type: "ExpressionStatement", loc: this.loc(start), expression };
  }

  private parseSayStatement(): Statement {
    const start = this.consumeKeyword("say");
    if (this.matchKeyword("embed")) {
      this.consumeBlockStart();
      const embed = this.parseEmbedBlock(start);
      return { type: "SayEmbedStatement", loc: this.loc(start), embed };
    }

    if (this.matchKeyword("with")) {
      this.consumeKeyword("components");
      const message = this.parseExpressionUntil(["NEWLINE", "EOF", "COLON"], ["in"]);
      this.consumeBlockStart();
      const components = this.parseComponents(start);
      return { type: "SayComponentsStatement", loc: this.loc(start), message, components };
    }

    const message = this.parseExpressionUntil(["NEWLINE", "EOF"], ["in"]);
    let channel: StringLiteral | undefined;
    if (this.matchKeyword("in")) {
      this.consumeKeyword("channel");
      channel = this.parseStringLiteral();
    }
    this.consumeLineEnd();
    return { type: "SayStatement", loc: this.loc(start), message, channel };
  }

  private parseComponents(start: Token): Component[] {
    this.skipNewlines();
    this.consumeType("INDENT", "Components need to be indented.");
    const components: Component[] = [];
    this.skipNewlines();

    while (!this.isAtEnd() && !this.check("DEDENT")) {
      if (this.matchKeyword("button")) {
        const id = this.parseStringLiteral();
        this.consumeKeyword("label");
        const label = this.parseStringLiteral();
        components.push({
          type: "ButtonComponent",
          loc: this.loc(start),
          id,
          label
        });
      } else if (this.matchKeyword("select")) {
        this.consumeKeyword("menu");
        const id = this.parseStringLiteral();
        this.consumeKeyword("with");
        this.consumeKeyword("options");
        const options: SelectOption[] = [];
        while (this.check("STRING")) {
          const label = this.parseStringLiteral();
          this.consumeKeyword("as");
          const value = this.parseStringLiteral();
          options.push({
            type: "SelectOption",
            loc: this.loc(start),
            label,
            value
          });
        }
        components.push({
          type: "SelectMenuComponent",
          loc: this.loc(start),
          id,
          options
        });
      } else {
        this.advance();
      }
      this.skipNewlines();
    }

    this.consumeType("DEDENT", "Expected end of components block.");
    return components;
  }

  private parseEmbedBlock(start: Token): EmbedBlock {
    this.skipNewlines();
    this.consumeType("INDENT", "Embed details need to be indented.");
    const embed: EmbedBlock = { type: "EmbedBlock", loc: this.loc(start), fields: [] };
    this.skipNewlines();

    while (!this.isAtEnd() && !this.check("DEDENT")) {
      if (this.matchKeyword("title")) {
        embed.title = this.parseStringLiteral();
      } else if (this.matchKeyword("description")) {
        embed.description = this.parseStringLiteral();
      } else if (this.matchKeyword("color")) {
        const color = this.consumeType("HASH_COLOR", "Embed colors look like #5865F2.");
        embed.color = { type: "ColorLiteral", loc: this.loc(color), value: color.value };
      } else if (this.matchKeyword("field")) {
        const name = this.parseStringLiteral();
        const value = this.parseStringLiteral();
        embed.fields.push({ type: "EmbedField", loc: name.loc, name, value });
      } else {
        throw this.error(this.peek(), "Embeds support title, description, color, and field lines.");
      }
      this.consumeLineEnd();
      this.skipNewlines();
    }

    this.consumeType("DEDENT", "Embed blocks need to return to the previous indentation level.");
    return embed;
  }

  private parseIfStatement(): Statement {
    const start = this.consumeKeyword("if");
    const condition = this.parseExpressionUntil(["COLON"]);
    this.consumeBlockStart();
    const consequent = this.parseBlock();
    let alternate: Statement[] = [];
    if (this.matchKeyword("else")) {
      this.consumeBlockStart();
      alternate = this.parseBlock();
    }
    return { type: "IfStatement", loc: this.loc(start), condition, consequent, alternate };
  }

  private parseForEachStatement(): Statement {
    const start = this.consumeKeyword("for");
    this.consumeKeyword("each");
    const itemName = this.consumeWord("for each needs an item name.").value;
    this.consumeKeyword("in");
    const iterable = this.parseExpressionUntil(["COLON"]);
    this.consumeBlockStart();
    return { type: "ForEachStatement", loc: this.loc(start), itemName, iterable, body: this.parseBlock() };
  }

  private parseRoleMutation(): Statement {
    const start = this.advance();
    const subject = this.parseAtom();
    this.consumeKeyword("role");
    const role = this.parseStringLiteral();
    this.consumeLineEnd();
    return start.value === "give"
      ? { type: "GiveRoleStatement", loc: this.loc(start), subject, role }
      : { type: "RemoveRoleStatement", loc: this.loc(start), subject, role };
  }

  private parseTryCatch(): Statement {
    const start = this.consumeKeyword("try");
    this.consumeBlockStart();
    const body = this.parseBlock();
    this.consumeKeyword("on");
    this.consumeKeyword("error");
    this.consumeBlockStart();
    const errorHandler = this.parseBlock();
    return { type: "TryCatchStatement", loc: this.loc(start), body, errorHandler };
  }

  private parseDuration(): DurationLiteral {
    const amount = this.parseNumberLiteral();
    const unit = this.consumeType("KEYWORD", "Durations need a unit like seconds, minutes, or hours.");
    return { type: "DurationLiteral", loc: amount.loc, amount, unit: unit.value as TimeUnit };
  }

  private parseExpressionUntilLineEnd(): Expression {
    return this.parseExpressionUntil(["NEWLINE", "EOF"]);
  }

  private parseExpressionUntil(endTypes: TokenType[], endKeywords: string[] = []): Expression {
    const parts: Expression[] = [];
    const operators: Token[] = [];

    while (!this.isAtEnd() && !endTypes.includes(this.peek().type) && !this.isEndKeyword(endKeywords)) {
      if (this.check("OPERATOR") || this.checkKeyword("or") || this.checkKeyword("and") || this.checkKeyword("has")) {
        const operator = this.advance();
        operators.push(operator);
        if (operator.value === "has" && this.checkKeyword("role")) {
          this.advance();
        }
      } else {
        parts.push(this.parseAtom());
      }
    }

    if (parts.length === 0) {
      throw this.error(this.peek(), "This line needs a value here.");
    }

    let expression = parts[0]!;
    for (let index = 1; index < parts.length; index += 1) {
      const operator = operators[index - 1]?.value ?? "+";
      expression = {
        type: "BinaryExpr",
        loc: expression.loc,
        operator,
        left: expression,
        right: parts[index]!
      } satisfies BinaryExpr;
    }
    return expression;
  }

  private parseAtom(): Expression {
    if (this.check("STRING")) {
      return this.parseStringLiteral();
    }

    if (this.check("NUMBER")) {
      return this.parseNumberLiteral();
    }

    if (this.matchKeyword("load")) {
      const start = this.previous();
      const namespace = this.parseAtom();
      const key = this.consumeWord("load needs a key name after the namespace.").value;
      let fallback: Expression | undefined;
      if (this.matchKeyword("or")) {
        fallback = this.parseAtom();
      }
      return { type: "LoadExpr", loc: this.loc(start), namespace, key, fallback };
    }

    if (this.matchKeyword("fetch")) {
      const start = this.previous();
      return { type: "FetchExpr", loc: this.loc(start), url: this.parseAtom() };
    }

    if (this.match("LPAREN")) {
      const expression = this.parseExpressionUntil(["RPAREN"]);
      this.consumeType("RPAREN", "Close this expression with ).");
      return expression;
    }

    const token = this.consumeWord("Expected a value.");
    const path = [token.value];
    while (this.match("DOT")) {
      path.push(this.consumeWord("Expected a name after the dot.").value);
    }

    if (path[0] === "args" && this.match("LBRACKET")) {
      const index = this.parseNumberLiteral();
      this.consumeType("RBRACKET", "Close args[index] with ].");
      return { type: "ArgsIndexExpr", loc: this.loc(token), index: index.value };
    }

    return path.length === 1
      ? { type: "IdentifierExpr", loc: this.loc(token), name: path[0]! }
      : { type: "MemberExpr", loc: this.loc(token), path };
  }

  private parseStringLiteral(): StringLiteral {
    const token = this.consumeType("STRING", "Text values need double quotes.");
    return { type: "StringLiteral", loc: this.loc(token), value: token.value, interpolated: Boolean(token.interpolated) };
  }

  private parseNumberLiteral() {
    const token = this.consumeType("NUMBER", "Expected a number here.");
    return { type: "NumberLiteral" as const, loc: this.loc(token), value: Number(token.value) };
  }

  private consumeBlockStart(): void {
    if (!this.match("COLON")) {
      const token = this.peek();
      throw makeCatalogError("NEWT_E002", token.line, token.column, this.sourceLineHint(token));
    }
    this.consumeLineEnd();
  }

  private consumeLineEnd(): void {
    if (this.match("NEWLINE") || this.check("EOF")) {
      return;
    }
    throw this.error(this.peek(), "I expected this line to end here.");
  }

  private skipNewlines(): void {
    while (this.match("NEWLINE")) {
      // Keep moving.
    }
  }

  private isEndKeyword(keywords: string[]): boolean {
    return this.check("KEYWORD") && keywords.includes(this.peek().value);
  }

  private consumeKeyword(value: string): Token {
    if (this.checkKeyword(value)) {
      return this.advance();
    }
    throw this.error(this.peek(), `Expected "${value}" here.`);
  }

  private matchKeyword(value: string): boolean {
    if (!this.checkKeyword(value)) {
      return false;
    }
    this.advance();
    return true;
  }

  private checkKeyword(value: string): boolean {
    return this.check("KEYWORD") && this.peek().value === value;
  }

  private consumeWord(message: string): Token {
    if (this.check("IDENTIFIER") || this.check("KEYWORD")) {
      return this.advance();
    }
    throw this.error(this.peek(), message);
  }

  private consumeType(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.error(this.peek(), message);
  }

  private match(type: TokenType): boolean {
    if (!this.check(type)) {
      return false;
    }
    this.advance();
    return true;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return type === "EOF";
    }
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  private peek(): Token {
    return this.tokens[this.current] ?? this.tokens[this.tokens.length - 1]!;
  }

  private previous(): Token {
    return this.tokens[this.current - 1] ?? this.tokens[0]!;
  }

  private loc(token: Token) {
    return { line: token.line, column: token.column };
  }

  private sourceLineHint(_token: Token): string | undefined {
    return undefined;
  }

  private error(token: Token, message: string): NewtError {
    return new NewtError({
      code: "NEWT_E001",
      message,
      suggestion: "Check the Newt syntax for this line and try again.",
      line: token.line,
      column: token.column
    });
  }
}
