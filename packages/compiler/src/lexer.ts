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

const keywords = new Set([
  "bot",
  "name",
  "prefix",
  "token",
  "on",
  "ready",
  "command",
  "slash",
  "button",
  "select",
  "menu",
  "click",
  "join",
  "leave",
  "message",
  "reaction",
  "add",
  "description",
  "with",
  "options",
  "components",
  "button",
  "label",
  "select",
  "let",
  "if",
  "else",
  "for",
  "every",
  "at",
  "reply",
  "say",
  "give",
  "remove",
  "require",
  "role",
  "store",
  "load",
  "fetch",
  "try",
  "error",
  "in",
  "from",
  "env",
  "each",
  "contains",
  "has",
  "or",
  "and",
  "not",
  "embed",
  "title",
  "description",
  "color",
  "field",
  "daily",
  "mute",
  "kick",
  "ban",
  "pin",
  "delete",
  "wait",
  "target",
  "channel",
  "server",
  "user",
  "member",
  "members",
  "minutes",
  "minute",
  "hours",
  "hour",
  "seconds",
  "second",
  "days",
  "day",
  "args",
  "random",
  "between",
  "round",
  "floor",
  "ceil",
  "uppercase",
  "lowercase",
  "replace",
  "split"
]);

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
    this.lines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
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
        index += 1;
        continue;
      }

      if (char === "#") {
        const maybeColor = lineWithoutTrailing.slice(index, index + 7);
        if (/^#[0-9a-fA-F]{6}$/u.test(maybeColor)) {
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

      if (/[0-9]/u.test(char)) {
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
        index += 1;
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
    if (indent === current) {
      return;
    }

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
      if (char === " ") {
        count += 1;
      } else if (char === "\t") {
        count += 4;
      } else {
        break;
      }
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
        index += 1;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        index += 1;
        continue;
      }

      if (char === "\"") {
        this.push("STRING", value, lineNumber, start + 1, /\{[^}]+\}/u.test(value));
        return index + 1;
      }

      value += char;
      index += 1;
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
    while (/[0-9.]/u.test(line[index] ?? "")) {
      index += 1;
    }

    this.push("NUMBER", line.slice(start, index), lineNumber, start + 1);
    return index;
  }

  private readWord(line: string, start: number, lineNumber: number): number {
    let index = start;
    while (/[A-Za-z0-9_]/u.test(line[index] ?? "")) {
      index += 1;
    }

    const value = line.slice(start, index);
    this.push(keywords.has(value) ? "KEYWORD" : "IDENTIFIER", value, lineNumber, start + 1);
    return index;
  }

  private singleCharToken(char: string): TokenType | undefined {
    switch (char) {
      case ":":
        return "COLON";
      case "=":
        return "EQUALS";
      case "(":
        return "LPAREN";
      case ")":
        return "RPAREN";
      case "[":
        return "LBRACKET";
      case "]":
        return "RBRACKET";
      case ",":
        return "COMMA";
      case ".":
        return "DOT";
      default:
        return undefined;
    }
  }

  private push(type: TokenType, value: string, line: number, column: number, interpolated?: boolean): void {
    this.tokens.push({ type, value, line, column, interpolated });
  }
}
