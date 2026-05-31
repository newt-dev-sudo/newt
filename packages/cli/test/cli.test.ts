import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildCommand } from "../src/commands/build.js";
import { checkCommand } from "../src/commands/check.js";

test("check command accepts a valid file", () => {
  const dir = mkdtempSync(join(tmpdir(), "newt-cli-"));
  try {
    const file = join(dir, "bot.newt");
    writeFileSync(file, `bot name "CliBot"\nbot prefix "!"\nbot token from env "DISCORD_TOKEN"\n\non command "hello":\n    reply "Hi!"\n`);
    assert.equal(checkCommand(file), 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("build command writes generated project", () => {
  const dir = mkdtempSync(join(tmpdir(), "newt-cli-"));
  try {
    const file = join(dir, "bot.newt");
    const out = join(dir, "dist");
    writeFileSync(file, `bot name "CliBot"\nbot prefix "!"\nbot token from env "DISCORD_TOKEN"\n\non command "hello":\n    reply "Hi!"\n`);
    assert.equal(buildCommand(file, { outDir: out }), 0);
    assert.match(readFileSync(join(out, "bot.js"), "utf8"), /client\.login/);
    assert.match(readFileSync(join(out, "package.json"), "utf8"), /discord\.js/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
