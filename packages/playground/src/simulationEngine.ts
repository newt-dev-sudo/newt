export interface SimulatedEmbed {
  title?: string;
  description?: string;
  color?: string;
  fields?: Array<{ name: string; value: string }>;
}

export interface SimulatedMessage {
  id: string;
  from: "bot" | "user" | "system";
  author: string;
  content: string;
  embed?: SimulatedEmbed;
  timestamp: Date;
}

export interface Simulation {
  sendMessage(content: string, author?: string): SimulatedMessage[];
  triggerJoin(memberName: string): SimulatedMessage[];
  triggerReaction(emoji: string, messageId: string): SimulatedMessage[];
}

interface Rule {
  kind: "command" | "contains" | "join" | "reaction" | "ready";
  match?: string;
  replies: SimulatedMessage[];
}

export function createSimulation(source: string): Simulation {
  const rules = extractRules(source);
  const state = { nextId: 1 };

  return {
    sendMessage(content: string, author = "Avery") {
      const messages = [message(state, "user", author, content)];
      const command = content.startsWith("!") ? content.slice(1).split(/\s+/)[0] : undefined;
      for (const rule of rules) {
        if (rule.kind === "command" && rule.match === command) {
          messages.push(...materialize(rule.replies, state, author));
        }
        if (rule.kind === "contains" && rule.match && content.includes(rule.match)) {
          messages.push(...materialize(rule.replies, state, author));
        }
      }
      return messages;
    },
    triggerJoin(memberName: string) {
      const messages = [message(state, "system", "Server", `${memberName} joined Test Server`)];
      messages.push(...materialize(rules.filter((rule) => rule.kind === "join").flatMap((rule) => rule.replies), state, memberName));
      return messages;
    },
    triggerReaction(emoji: string, messageId: string) {
      const messages = [message(state, "user", "Avery", `Reacted ${emoji} to ${messageId}`)];
      messages.push(...materialize(rules.filter((rule) => rule.kind === "reaction" && rule.match === emoji).flatMap((rule) => rule.replies), state, "Avery"));
      return messages;
    }
  };
}

function extractRules(source: string): Rule[] {
  const lines = source.split(/\r?\n/);
  const rules: Rule[] = [];
  let current: Rule | undefined;
  let pendingEmbed: SimulatedEmbed | undefined;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith("#")) continue;

    const command = line.match(/^on command "([^"]+)":$/);
    const contains = line.match(/^on message contains "([^"]+)":$/);
    const reaction = line.match(/^on reaction add "([^"]+)":$/);

    if (line === "on ready:") current = pushRule(rules, { kind: "ready", replies: [] });
    else if (command) current = pushRule(rules, { kind: "command", match: command[1], replies: [] });
    else if (contains) current = pushRule(rules, { kind: "contains", match: contains[1], replies: [] });
    else if (line === "on join:") current = pushRule(rules, { kind: "join", replies: [] });
    else if (reaction) current = pushRule(rules, { kind: "reaction", match: reaction[1], replies: [] });
    else if (current && (line.startsWith("reply ") || line.startsWith("say "))) {
      const text = unquote(line.replace(/^(reply|say)\s+/, "").replace(/\s+in channel "([^"]+)"$/, ""));
      if (line === "say embed:") {
        pendingEmbed = {};
        current.replies.push(templateMessage("", pendingEmbed));
      } else {
        current.replies.push(templateMessage(text));
      }
    } else if (pendingEmbed && line.startsWith("title ")) {
      pendingEmbed.title = unquote(line.slice("title ".length));
    } else if (pendingEmbed && line.startsWith("description ")) {
      pendingEmbed.description = unquote(line.slice("description ".length));
    } else if (pendingEmbed && line.startsWith("color ")) {
      pendingEmbed.color = line.slice("color ".length);
    } else if (pendingEmbed && line.startsWith("field ")) {
      const [, name = "", value = ""] = line.match(/^field "([^"]+)" "([^"]+)"$/) ?? [];
      pendingEmbed.fields = [...(pendingEmbed.fields ?? []), { name, value }];
    }
  }

  return rules;
}

function pushRule(rules: Rule[], rule: Rule): Rule {
  rules.push(rule);
  return rule;
}

function templateMessage(content: string, embed?: SimulatedEmbed): SimulatedMessage {
  return { id: "template", from: "bot", author: "Newt Bot", content, embed, timestamp: new Date(0) };
}

function materialize(messages: SimulatedMessage[], state: { nextId: number }, userName: string): SimulatedMessage[] {
  return messages.map((item) => ({
    ...item,
    id: String(state.nextId++),
    content: interpolate(item.content, userName),
    embed: item.embed ? interpolateEmbed(item.embed, userName) : undefined,
    timestamp: new Date()
  }));
}

function interpolateEmbed(embed: SimulatedEmbed, userName: string): SimulatedEmbed {
  return {
    title: embed.title ? interpolate(embed.title, userName) : undefined,
    description: embed.description ? interpolate(embed.description, userName) : undefined,
    color: embed.color,
    fields: embed.fields?.map((field) => ({
      name: interpolate(field.name, userName),
      value: interpolate(field.value, userName)
    }))
  };
}

function interpolate(text: string, userName: string): string {
  return text
    .replace(/\{user\.name\}/g, userName)
    .replace(/\{user\.mention\}/g, `@${userName}`)
    .replace(/\{target\}/g, "@TargetUser");
}

function unquote(text: string): string {
  return text.replace(/^"/, "").replace(/"$/, "");
}

function message(state: { nextId: number }, from: SimulatedMessage["from"], author: string, content: string): SimulatedMessage {
  return { id: String(state.nextId++), from, author, content, timestamp: new Date() };
}
