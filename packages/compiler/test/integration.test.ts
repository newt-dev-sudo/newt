import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { compile, tokenize } from "../src/index.js";

const examplesDir = resolve("../../examples");

test("all example programs compile", () => {
  const files = readdirSync(examplesDir).filter((file) => file.endsWith(".newt"));
  assert.deepEqual(files.sort(), [
    "hello-world.newt",
    "moderation-bot.newt",
    "points-bot.newt",
    "welcome-bot.newt"
  ]);

  for (const file of files) {
    const source = readFileSync(join(examplesDir, file), "utf8");
    const result = compile(source, file);
    assert.equal(result.success, true, `${file} should compile`);
    if (result.success) {
      assert.match(result.botJs, /new Client/);
      assert.match(result.packageJson, /discord\.js/);
    }
  }
});

test("lexer emits indentation and interpolated string tokens", () => {
  const tokens = tokenize(`on command "hello":\n    reply "Hi {user.name}!"\n`);
  assert.ok(tokens.some((token) => token.type === "INDENT"));
  assert.ok(tokens.some((token) => token.type === "DEDENT"));
  assert.ok(tokens.some((token) => token.type === "STRING" && token.interpolated));
});

test("compiler reports missing bot token", () => {
  const result = compile(`bot name "NoToken"\n\non ready:\n    say "Ready"\n`, "broken.newt");
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.errors.some((error) => error.code === "NEWT_E009"));
  }
});
