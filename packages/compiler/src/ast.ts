export interface SourceLocation {
  line: number;
  column: number;
}

export interface BaseNode {
  type: string;
  loc: SourceLocation;
}

export interface Program extends BaseNode {
  type: "Program";
  body: TopLevelNode[];
}

export type TopLevelNode = BotDecl | Handler | TimerDecl;

export type BotDeclKind = "name" | "prefix" | "token";

export interface BotDecl extends BaseNode {
  type: "BotDecl";
  kind: BotDeclKind;
  value: StringLiteral;
  fromEnv: boolean;
}

export type Handler =
  | ReadyHandler
  | CommandHandler
  | SlashCommandHandler
  | MessageContainsHandler
  | JoinHandler
  | LeaveHandler
  | ReactionAddHandler
  | ButtonClickHandler
  | SelectMenuHandler;

export interface ReadyHandler extends BaseNode {
  type: "ReadyHandler";
  body: Statement[];
}

export interface CommandHandler extends BaseNode {
  type: "CommandHandler";
  command: string;
  body: Statement[];
}

export interface MessageContainsHandler extends BaseNode {
  type: "MessageContainsHandler";
  needle: StringLiteral;
  body: Statement[];
}

export interface JoinHandler extends BaseNode {
  type: "JoinHandler";
  body: Statement[];
}

export interface LeaveHandler extends BaseNode {
  type: "LeaveHandler";
  body: Statement[];
}

export interface ReactionAddHandler extends BaseNode {
  type: "ReactionAddHandler";
  emoji: StringLiteral;
  body: Statement[];
}

export interface SlashCommandHandler extends BaseNode {
  type: "SlashCommandHandler";
  command: string;
  description?: StringLiteral;
  options?: SlashOption[];
  body: Statement[];
}

export interface SlashOption extends BaseNode {
  type: "SlashOption";
  name: string;
  description: StringLiteral;
  required: BooleanLiteral;
  optionType: "string" | "number" | "boolean" | "user" | "channel" | "role";
}

export interface ButtonClickHandler extends BaseNode {
  type: "ButtonClickHandler";
  buttonId: StringLiteral;
  body: Statement[];
}

export interface SelectMenuHandler extends BaseNode {
  type: "SelectMenuHandler";
  menuId: StringLiteral;
  body: Statement[];
}

export type TimerDecl = EveryTimerDecl | DailyTimerDecl;

export interface EveryTimerDecl extends BaseNode {
  type: "EveryTimerDecl";
  amount: NumberLiteral;
  unit: TimeUnit;
  body: Statement[];
}

export interface DailyTimerDecl extends BaseNode {
  type: "DailyTimerDecl";
  time: StringLiteral;
  body: Statement[];
}

export type TimeUnit = "second" | "seconds" | "minute" | "minutes" | "hour" | "hours" | "day" | "days";

export type Statement =
  | ReplyStatement
  | SayStatement
  | SayEmbedStatement
  | SayComponentsStatement
  | LetDecl
  | StoreStatement
  | IfStatement
  | ForEachStatement
  | RequireRoleStatement
  | GiveRoleStatement
  | RemoveRoleStatement
  | MuteStatement
  | KickStatement
  | BanStatement
  | PinStatement
  | DeleteKeyStatement
  | EditMessageStatement
  | DeleteMessageStatement
  | UploadStatement
  | WaitStatement
  | TryCatchStatement
  | ExpressionStatement;

export interface ReplyStatement extends BaseNode {
  type: "ReplyStatement";
  message: Expression;
}

export interface SayStatement extends BaseNode {
  type: "SayStatement";
  message: Expression;
  channel?: StringLiteral;
}

export interface SayEmbedStatement extends BaseNode {
  type: "SayEmbedStatement";
  embed: EmbedBlock;
}

export interface SayComponentsStatement extends BaseNode {
  type: "SayComponentsStatement";
  message: Expression;
  components: Component[];
}

export interface Component extends BaseNode {
  type: "ButtonComponent" | "SelectMenuComponent";
  id: StringLiteral;
  label?: StringLiteral;
  options?: SelectOption[];
}

export interface SelectOption extends BaseNode {
  type: "SelectOption";
  label: StringLiteral;
  value: StringLiteral;
}

export interface EmbedBlock extends BaseNode {
  type: "EmbedBlock";
  title?: StringLiteral;
  description?: StringLiteral;
  color?: ColorLiteral;
  fields: EmbedField[];
}

export interface EmbedField extends BaseNode {
  type: "EmbedField";
  name: StringLiteral;
  value: StringLiteral;
}

export interface LetDecl extends BaseNode {
  type: "LetDecl";
  name: string;
  value: Expression;
}

export interface StoreStatement extends BaseNode {
  type: "StoreStatement";
  namespace: Expression;
  key: string;
  value: Expression;
}

export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  consequent: Statement[];
  alternate: Statement[];
}

export interface ForEachStatement extends BaseNode {
  type: "ForEachStatement";
  itemName: string;
  iterable: Expression;
  body: Statement[];
}

export interface RequireRoleStatement extends BaseNode {
  type: "RequireRoleStatement";
  role: StringLiteral;
}

export interface GiveRoleStatement extends BaseNode {
  type: "GiveRoleStatement";
  subject: Expression;
  role: StringLiteral;
}

export interface RemoveRoleStatement extends BaseNode {
  type: "RemoveRoleStatement";
  subject: Expression;
  role: StringLiteral;
}

export interface MuteStatement extends BaseNode {
  type: "MuteStatement";
  subject: Expression;
  duration?: DurationLiteral;
}

export interface KickStatement extends BaseNode {
  type: "KickStatement";
  subject: Expression;
}

export interface BanStatement extends BaseNode {
  type: "BanStatement";
  subject: Expression;
}

export interface PinStatement extends BaseNode {
  type: "PinStatement";
  target: Expression;
}

export interface DeleteKeyStatement extends BaseNode {
  type: "DeleteKeyStatement";
  namespace: Expression;
  key: string;
}

export interface EditMessageStatement extends BaseNode {
  type: "EditMessageStatement";
  target: Expression;
  newContent: Expression;
}

export interface DeleteMessageStatement extends BaseNode {
  type: "DeleteMessageStatement";
  target: Expression;
}

export interface UploadStatement extends BaseNode {
  type: "UploadStatement";
  filePath: Expression;
  message?: Expression;
}

export interface WaitStatement extends BaseNode {
  type: "WaitStatement";
  duration: DurationLiteral;
}

export interface TryCatchStatement extends BaseNode {
  type: "TryCatchStatement";
  body: Statement[];
  errorHandler: Statement[];
}

export interface ExpressionStatement extends BaseNode {
  type: "ExpressionStatement";
  expression: Expression;
}

export type Expression =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | ColorLiteral
  | IdentifierExpr
  | MemberExpr
  | ArgsIndexExpr
  | LoadExpr
  | FetchExpr
  | GetUserExpr
  | GetGuildExpr
  | BinaryExpr
  | UnaryExpr
  | CallExpr;

export interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
  interpolated: boolean;
}

export interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  value: number;
}

export interface BooleanLiteral extends BaseNode {
  type: "BooleanLiteral";
  value: boolean;
}

export interface ColorLiteral extends BaseNode {
  type: "ColorLiteral";
  value: string;
}

export interface IdentifierExpr extends BaseNode {
  type: "IdentifierExpr";
  name: string;
}

export interface MemberExpr extends BaseNode {
  type: "MemberExpr";
  path: string[];
}

export interface ArgsIndexExpr extends BaseNode {
  type: "ArgsIndexExpr";
  index: number;
}

export interface LoadExpr extends BaseNode {
  type: "LoadExpr";
  namespace: Expression;
  key: string;
  fallback?: Expression;
}

export interface FetchExpr extends BaseNode {
  type: "FetchExpr";
  url: Expression;
}

export interface GetUserExpr extends BaseNode {
  type: "GetUserExpr";
  userId: Expression;
}

export interface GetGuildExpr extends BaseNode {
  type: "GetGuildExpr";
  guildId: Expression;
}

export interface BinaryExpr extends BaseNode {
  type: "BinaryExpr";
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpr extends BaseNode {
  type: "UnaryExpr";
  operator: string;
  argument: Expression;
}

export interface CallExpr extends BaseNode {
  type: "CallExpr";
  callee: string;
  args: Expression[];
}

export interface DurationLiteral extends BaseNode {
  type: "DurationLiteral";
  amount: NumberLiteral;
  unit: TimeUnit;
}
