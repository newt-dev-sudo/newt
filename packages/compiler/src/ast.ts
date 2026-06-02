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
  | MessageUpdateHandler
  | MessageDeleteHandler
  | JoinHandler
  | LeaveHandler
  | ReactionAddHandler
  | ReactionRemoveHandler
  | GuildMemberUpdateHandler
  | PresenceUpdateHandler
  | ButtonClickHandler
  | SelectMenuHandler
  | ModalSubmitHandler;

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

export interface MessageUpdateHandler extends BaseNode {
  type: "MessageUpdateHandler";
  body: Statement[];
}

export interface MessageDeleteHandler extends BaseNode {
  type: "MessageDeleteHandler";
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

export interface ReactionRemoveHandler extends BaseNode {
  type: "ReactionRemoveHandler";
  emoji: StringLiteral;
  body: Statement[];
}

export interface GuildMemberUpdateHandler extends BaseNode {
  type: "GuildMemberUpdateHandler";
  body: Statement[];
}

export interface PresenceUpdateHandler extends BaseNode {
  type: "PresenceUpdateHandler";
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

export interface ModalSubmitHandler extends BaseNode {
  type: "ModalSubmitHandler";
  modalId: StringLiteral;
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
  | ShowModalStatement
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
  | UnbanStatement
  | PinStatement
  | UnpinStatement
  | AddReactionStatement
  | RemoveReactionStatement
  | RemoveAllReactionsStatement
  | CreateChannelStatement
  | DeleteChannelStatement
  | EditChannelStatement
  | CreateRoleStatement
  | DeleteRoleStatement
  | EditRoleStatement
  | SendDMStatement
  | DeleteKeyStatement
  | EditMessageStatement
  | DeleteMessageStatement
  | UploadStatement
  | SetActivityStatement
  | WaitStatement
  | TryCatchStatement
  | ExpressionStatement;

export interface ReplyStatement extends BaseNode {
  type: "ReplyStatement";
  message: Expression;
  ephemeral: boolean;
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

export interface ShowModalStatement extends BaseNode {
  type: "ShowModalStatement";
  modalId: StringLiteral;
  title: StringLiteral;
  inputs: TextInput[];
}

export interface Component extends BaseNode {
  type: "ButtonComponent" | "SelectMenuComponent" | "ModalComponent";
  id: StringLiteral;
  label?: StringLiteral;
  style?: StringLiteral;
  url?: StringLiteral;
  menuType?: StringLiteral;
  options?: SelectOption[];
  title?: StringLiteral;
  inputs?: TextInput[];
}

export interface TextInput extends BaseNode {
  type: "TextInput";
  id: StringLiteral;
  label: StringLiteral;
  style?: StringLiteral;
  required?: boolean;
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
  author?: StringLiteral;
  footer?: StringLiteral;
  image?: StringLiteral;
  thumbnail?: StringLiteral;
  url?: StringLiteral;
  timestamp?: boolean;
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

export interface UnbanStatement extends BaseNode {
  type: "UnbanStatement";
  subject: Expression;
}

export interface PinStatement extends BaseNode {
  type: "PinStatement";
  target: Expression;
}

export interface UnpinStatement extends BaseNode {
  type: "UnpinStatement";
  target: Expression;
}

export interface AddReactionStatement extends BaseNode {
  type: "AddReactionStatement";
  target: Expression;
  emoji: StringLiteral;
}

export interface RemoveReactionStatement extends BaseNode {
  type: "RemoveReactionStatement";
  target: Expression;
  emoji: StringLiteral;
}

export interface RemoveAllReactionsStatement extends BaseNode {
  type: "RemoveAllReactionsStatement";
  target: Expression;
}

export interface CreateChannelStatement extends BaseNode {
  type: "CreateChannelStatement";
  name: StringLiteral;
  channelType?: StringLiteral;
}

export interface DeleteChannelStatement extends BaseNode {
  type: "DeleteChannelStatement";
  target: Expression;
}

export interface EditChannelStatement extends BaseNode {
  type: "EditChannelStatement";
  target: Expression;
  newName?: StringLiteral;
}

export interface CreateRoleStatement extends BaseNode {
  type: "CreateRoleStatement";
  name: StringLiteral;
}

export interface DeleteRoleStatement extends BaseNode {
  type: "DeleteRoleStatement";
  target: Expression;
}

export interface EditRoleStatement extends BaseNode {
  type: "EditRoleStatement";
  target: Expression;
  newName?: StringLiteral;
}

export interface SendDMStatement extends BaseNode {
  type: "SendDMStatement";
  target: Expression;
  message: Expression;
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

export interface SetActivityStatement extends BaseNode {
  type: "SetActivityStatement";
  activity: Expression;
  activityType?: StringLiteral;
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
  | RandomExpr
  | GetReactionUsersExpr
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

export interface RandomExpr extends BaseNode {
  type: "RandomExpr";
  min?: Expression;
  max?: Expression;
}

export interface GetReactionUsersExpr extends BaseNode {
  type: "GetReactionUsersExpr";
  messageId: Expression;
  emoji: Expression;
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
