import { makeCatalogError, NewtError } from "./errors.js";

export type TokenType =
  | "KEYWORD"
  | "STRING"
  | "NUMBER"
  | "IDENTIFIER"
  | "INDENT"
  | "DEDENT"
  | "NEWLINE"
  | "COLON"
  | "EQUALS"
  | "LPAREN"
  | "RPAREN"
  | "LBRACKET"
  | "RBRACKET"
  | "COMMA"
  | "DOT"
  | "OPERATOR"
  | "HASH_COLOR"
  | "COMMENT"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  interpolated?: boolean;
}

// Fix #7 & #12: Removed all ~15 duplicate keyword entries that were caused by
// copy-paste assembly of keyword blocks. Each keyword now appears exactly once.
// Duplicates that were present: role(x3), channel(x3), add(x2), join(x2), leave(x2),
// member(x2), update(x2), description(x2), with(x2), send(x2), from(x2),
// reaction(x2), create(x2), random(x2), second(x2).
// "second" was listed both as a time unit and as an ordinal — kept once; the
// parser resolves context-dependent meaning at parse time, not lex time.
const keywords = new Set([
  // Bot config
  "bot", "name", "prefix", "token",
  // Top-level structure
  "on", "every", "at", "daily",
  // Event names
  "ready", "command", "slash", "button", "select", "menu", "modal", "submit",
  "join", "leave", "message", "reaction", "member", "presence",
  // Event sub-keywords
  "click", "contains", "update", "delete", "add", "remove",
  // Component styles
  "danger", "success", "secondary", "link",
  // Input types
  "input", "text", "short", "paragraph", "required",
  // Option / resource types
  "channel", "role", "mentionable",
  // Embed keywords
  "embed", "title", "description", "color", "field", "author", "footer",
  "image", "thumbnail", "url", "timestamp",
  // Statement keywords
  "let", "if", "else", "for", "each", "in",
  "reply", "say", "show", "dm", "send", "give", "require",
  "store", "load", "fetch", "try", "error",
  "from", "env", "with", "options", "components", "label", "style", "type",
  // Moderation
  "mute", "kick", "ban", "unban", "pin", "unpin",
  // Reactions
  "reactions", "clear", "all",
  // Resource management
  "create", "edit", "upload",
  // Activity / presence
  "set", "activity",
  // Flow control
  "wait", "ephemeral", "target",
  // References
  "to", "server", "user", "members",
  // Time units
  "minutes", "minute", "hours", "hour", "seconds", "second", "days", "day",
  // Built-in variables
  "args",
  // Built-in API functions
  "getUser", "getGuild", "getReactionUsers",
  // Math helpers
  "random", "between", "round", "floor", "ceil",
  // String helpers
  "uppercase", "lowercase", "split", "trim", "length",
  // Ordinals (argument access: "first", "third", "last"; "second" covered above)
  "first", "third", "last", "of",
  // Misc syntax
  "as", "be", "by", "named", "push",
  // Voice
  "play", "stop", "pause", "resume", "volume",
  // Webhooks
  "webhook", "execute",
  // Threads
  "thread", "archive", "lock", "unlock",
  // Subcommands
  "subcommand",
  // Boolean literals
  "true", "false",
  // Boolean / logical operators
  "or", "and", "not", "has",
]);

const CHAR_TOKEN_TYPES: Record<string, TokenType> = {
  ":": "COLON",
  "=": "EQUALS",
  "(": "LPAREN",
  ")": "RPAREN",
  "[": "LBRACKET",
  "]": "RBRACKET",
  ",": "COMMA",
  ".": "DOT"
};

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}

class Lexer {
  private readonly tokens: Token[] = [];
  private readonly indentStack = [0];
  private indentUnit: number | undefined;
  private readonly lines: string[];

  constructor(private readonly source: string) {
    this.lines = source.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
  }

  tokenize(): Token[] {
    for (let index = 0; index < this.lines.length; index += 1) {
      this.tokenizeLine(this.lines[index] ?? "", index + 1);
    }

    const lastLine = Math.max(1, this.lines.length);
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.push("DEDENT", "", lastLine, 1);
    }

    this.push("EOF", "", lastLine, (this.lines[this.lines.length - 1]?.length ?? 0) + 1);
    return this.tokens;
  }

  private tokenizeLine(rawLine: string, lineNumber: number): void {
    const lineWithoutTrailing = rawLine.replace(/\s+$/u, "");
    const contentStart = this.countIndent(lineWithoutTrailing);
    const content = lineWithoutTrailing.slice(contentStart);

    if (content.length === 0 || content.startsWith("#")) {
      return;
    }

    this.applyIndent(contentStart, lineNumber, rawLine);

    let index = contentStart;
    while (index < lineWithoutTrailing.length) {
      const char = lineWithoutTrailing[index] ?? "";
      const column = index + 1;

      if (char === " " || char === "\t") {
        index++;
        continue;
      }

      if (char === "#") {
        const maybeColor = lineWithoutTrailing.slice(index, index + 7);
        if (/^#[\da-fA-F]{6}$/u.test(maybeColor)) {
          this.push("HASH_COLOR", maybeColor, lineNumber, column);
          index += 7;
          continue;
        }
        this.push("COMMENT", lineWithoutTrailing.slice(index), lineNumber, column);
        break;
      }

      if (char === "\"") {
        index = this.readString(lineWithoutTrailing, index, lineNumber);
        continue;
      }

      if (/[\d]/u.test(char)) {
        index = this.readNumber(lineWithoutTrailing, index, lineNumber);
        continue;
      }

      if (/[A-Za-z_]/u.test(char)) {
        index = this.readWord(lineWithoutTrailing, index, lineNumber);
        continue;
      }

      const singleToken = this.singleCharToken(char);
      if (singleToken) {
        this.push(singleToken, char, lineNumber, column);
        index++;
        continue;
      }

      if ("+-*/<>!".includes(char)) {
        const next = lineWithoutTrailing[index + 1];
        const value = next === "=" ? `${char}=` : char;
        this.push("OPERATOR", value, lineNumber, column);
        index += value.length;
        continue;
      }

      throw new NewtError({
        code: "NEWT_E001",
        message: `I do not know what to do with "${char}" here.`,
        suggestion: "Check for a missing quote or an extra symbol.",
        line: lineNumber,
        column,
        sourceLine: rawLine
      });
    }

    this.push("NEWLINE", "", lineNumber, lineWithoutTrailing.length + 1);
  }

  private applyIndent(indent: number, lineNumber: number, sourceLine: string): void {
    const current = this.indentStack[this.indentStack.length - 1] ?? 0;
    if (indent === current) return;

    if (indent > current) {
      const diff = indent - current;
      if (!this.indentUnit) {
        if (diff !== 2 && diff !== 4) {
          throw makeCatalogError("NEWT_E006", lineNumber, 1, sourceLine);
        }
        this.indentUnit = diff;
      } else if (diff % this.indentUnit !== 0) {
        throw makeCatalogError("NEWT_E006", lineNumber, 1, sourceLine);
      }
      this.indentStack.push(indent);
      this.push("INDENT", "", lineNumber, 1);
      return;
    }

    while (this.indentStack.length > 1 && indent < (this.indentStack[this.indentStack.length - 1] ?? 0)) {
      this.indentStack.pop();
      this.push("DEDENT", "", lineNumber, 1);
    }

    if (indent !== (this.indentStack[this.indentStack.length - 1] ?? 0)) {
      throw makeCatalogError("NEWT_E006", lineNumber, 1, sourceLine);
    }
  }

  private countIndent(line: string): number {
    let count = 0;
    for (const char of line) {
      if (char === " ") count++;
      else if (char === "\t") count += 4;
      else break;
    }
    return count;
  }

  private readString(line: string, start: number, lineNumber: number): number {
    let index = start + 1;
    let value = "";
    let escaped = false;

    while (index < line.length) {
      const char = line[index] ?? "";

      if (escaped) {
        value += char;
        escaped = false;
        index++;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        index++;
        continue;
      }

      if (char === "\"") {
        this.push("STRING", value, lineNumber, start + 1, /\{[^}]+\}/u.test(value));
        return index + 1;
      }

      value += char;
      index++;
    }

    throw new NewtError({
      code: "NEWT_E001",
      message: "This string starts with a quote but never closes.",
      suggestion: "Add a closing double quote at the end of the text.",
      line: lineNumber,
      column: start + 1,
      sourceLine: line,
      length: Math.max(1, line.length - start)
    });
  }

  private readNumber(line: string, start: number, lineNumber: number): number {
    let index = start;
    while (/[\d.]/u.test(line[index] ?? "")) index++;
    this.push("NUMBER", line.slice(start, index), lineNumber, start + 1);
    return index;
  }

  private readWord(line: string, start: number, lineNumber: number): number {
    let index = start;
    while (/[\w]/u.test(line[index] ?? "")) index++;
    const value = line.slice(start, index);
    this.push(keywords.has(value) ? "KEYWORD" : "IDENTIFIER", value, lineNumber, start + 1);
    return index;
  }

  private singleCharToken(char: string): TokenType | undefined {
    return CHAR_TOKEN_TYPES[char];
  }

  private push(type: TokenType, value: string, line: number, column: number, interpolated?: boolean): void {
    this.tokens.push({ type, value, line, column, interpolated });
  }
}
