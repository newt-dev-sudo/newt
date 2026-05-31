import { existsSync } from "node:fs";
import { basename } from "node:path";
import { writeTextFile } from "../util.js";

const templates: Record<string, string> = {
  hello: `bot name "HelloNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on ready:
    say "HelloNewt is online!" in channel "bot-status"

on command "hello":
    reply "Hey there, {user.name}!"
`,
  welcome: `bot name "WelcomeNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on join:
    give user role "Member"
    say embed:
        title "Welcome, {user.name}!"
        description "Read #rules first, then say hello."
        color #5865F2
`,
  points: `bot name "PointsNewt"
bot prefix "!"
bot token from env "DISCORD_TOKEN"

on command "points":
    let current = load user.id points or 0
    store user.id points = current + 1
    reply "You have {load user.id points} points."
`,
  blank: `bot name "MyNewtBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"
`
};

export function newCommand(name = "mybot", template = "hello"): number {
  const safeName = basename(name).replace(/[^A-Za-z0-9_-]/g, "-").replace(/\.newt$/i, "");
  const filename = `${safeName || "mybot"}.newt`;
  if (existsSync(filename)) {
    console.error(`${filename} already exists. Pick another name or move the existing file.`);
    return 1;
  }

  const source = templates[template] ?? templates.hello;
  writeTextFile(filename, source);
  console.log(`OK Created ${filename} - run: newt check ${filename}`);
  return 0;
}
