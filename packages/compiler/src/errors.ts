export type NewtErrorSeverity = "error" | "warning";

export type NewtErrorCode =
  | "NEWT_E001"
  | "NEWT_E002"
  | "NEWT_E003"
  | "NEWT_E004"
  | "NEWT_E005"
  | "NEWT_E006"
  | "NEWT_E007"
  | "NEWT_E008"
  | "NEWT_E009"
  | "NEWT_E010"
  | "NEWT_E011"
  | "NEWT_E012"
  | "NEWT_E013"
  | "NEWT_E014"
  | "NEWT_E015";

export interface NewtErrorOptions {
  code: NewtErrorCode;
  message: string;
  line: number;
  column: number;
  sourceLine?: string;
  suggestion?: string;
  severity?: NewtErrorSeverity;
  filename?: string;
  length?: number;
}

export class NewtError extends Error {
  readonly code: NewtErrorCode;
  readonly line: number;
  readonly column: number;
  readonly sourceLine?: string;
  readonly suggestion?: string;
  readonly severity: NewtErrorSeverity;
  readonly filename?: string;
  readonly length: number;

  constructor(options: NewtErrorOptions) {
    super(options.message);
    this.name = "NewtError";
    this.code = options.code;
    this.line = options.line;
    this.column = options.column;
    this.sourceLine = options.sourceLine;
    this.suggestion = options.suggestion;
    this.severity = options.severity ?? "error";
    this.filename = options.filename;
    this.length = options.length ?? 1;
  }
}

export const errorCatalog: Record<NewtErrorCode, { message: string; suggestion: string; severity?: NewtErrorSeverity }> = {
  NEWT_E001: {
    message: "Strings must be in quotes.",
    suggestion: "Wrap the text in double quotes, like: reply \"Hello!\""
  },
  NEWT_E002: {
    message: "Event handlers need a colon at the end.",
    suggestion: "Try ending the line with a colon, like: on command \"hello\":"
  },
  NEWT_E003: {
    message: "That is not a known event name.",
    suggestion: "Try one of: on ready, on command, on join, on leave, on message contains, or on reaction add."
  },
  NEWT_E004: {
    message: "This line needs to be inside a handler.",
    suggestion: "Put this action under a line like: on command \"hello\":"
  },
  NEWT_E005: {
    message: "[SECURITY WARNING] Never put your bot token directly in the file.",
    suggestion: "Use: bot token from env \"DISCORD_TOKEN\"",
    severity: "warning"
  },
  NEWT_E006: {
    message: "Indentation looks off on this line.",
    suggestion: "Use 2 or 4 spaces consistently within the file."
  },
  NEWT_E007: {
    message: "This variable has not been defined yet.",
    suggestion: "Add a let line before using it, like: let name = \"Newt\""
  },
  NEWT_E008: {
    message: "Your bot needs a name.",
    suggestion: "Add a line near the top: bot name \"MyBot\""
  },
  NEWT_E009: {
    message: "Your bot needs a token source.",
    suggestion: "Add: bot token from env \"DISCORD_TOKEN\""
  },
  NEWT_E010: {
    message: "Embed colors must be hex colors.",
    suggestion: "Use a six-digit color like: color #5865F2"
  },
  NEWT_E011: {
    message: "Network requests should have an error fallback.",
    suggestion: "Put fetch inside try: and add an on error: block."
  },
  NEWT_E012: {
    message: "target only works when a command message mentions someone.",
    suggestion: "Make sure this command is used like: !mute @Someone"
  },
  NEWT_E013: {
    message: "That built-in variable does not exist.",
    suggestion: "Use a built-in like user.name, message.content, channel.name, server.name, args, or target."
  },
  NEWT_E014: {
    message: "Timer intervals must be greater than zero.",
    suggestion: "Use a positive interval, like: every 1 hour:"
  },
  NEWT_E015: {
    message: "Role names cannot be empty.",
    suggestion: "Use a real role name, like: require role \"Moderator\""
  }
};

export function makeCatalogError(
  code: NewtErrorCode,
  line: number,
  column: number,
  sourceLine?: string,
  overrides: Partial<NewtErrorOptions> = {}
): NewtError {
  const entry = errorCatalog[code];
  return new NewtError({
    code,
    line,
    column,
    sourceLine,
    message: entry.message,
    suggestion: entry.suggestion,
    severity: entry.severity,
    ...overrides
  });
}

export function formatError(error: NewtError, sourceOrFilename = ""): string {
  const filename = error.filename ?? (sourceOrFilename.includes("\n") ? "input.newt" : sourceOrFilename || "input.newt");
  const sourceLine = error.sourceLine ?? getSourceLine(sourceOrFilename, error.line);
  const label = error.severity === "warning" ? "Warning" : "Error";
  const caretOffset = Math.max(0, error.column - 1);
  const caretLength = Math.max(1, error.length);
  const caretLine = `${" ".repeat(caretOffset)}${"^".repeat(caretLength)}`;
  const suggestion = error.suggestion ? ` ${error.suggestion}` : "";

  return [
    `${label} [${error.code}] on line ${error.line} in ${filename}:`,
    "",
    `    ${sourceLine}`,
    `    ${caretLine}`,
    `${error.message}${suggestion}`
  ].join("\n");
}

function getSourceLine(source: string, line: number): string {
  if (!source.includes("\n")) {
    return "";
  }

  return source.split(/\r?\n/)[line - 1] ?? "";
}
