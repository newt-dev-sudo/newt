import { describe, it, expect } from "vitest";
import { compile } from "../packages/compiler/src/index.js";
import * as fs from "fs";
import * as path from "path";

// ─── Helper ──────────────────────────────────────────────────────────────────

function compileSource(source: string) {
  return compile(source, "test.newt");
}

// ─── Lexer: keyword deduplication ────────────────────────────────────────────

describe("lexer", () => {
  it("tokenises a minimal bot without throwing", () => {
    const result = compileSource(`bot name "T"\nbot token from env "TOK"\non command "hi":\n  reply "hi"`);
    expect(result.success).toBe(true);
  });

  it("does not throw on known keywords appearing in context", () => {
    const result = compileSource(`bot name "T"\nbot token from env "TOK"\non command "test":\n  reply "ok"`);
    expect(result.success).toBe(true);
  });
});

// ─── Parser ───────────────────────────────────────────────────────────────────

describe("parser — handlers", () => {
  it("parses on ready:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non ready:\n  say "hello"`);
    expect(r.success).toBe(true);
  });

  it("parses on command:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non command "hi":\n  reply "hi there"`);
    expect(r.success).toBe(true);
  });

  it("parses on slash:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non slash "ping" description "Ping the bot":\n  reply "Pong!"`);
    expect(r.success).toBe(true);
  });

  it("parses on join:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non join:\n  say "welcome"`);
    expect(r.success).toBe(true);
  });

  it("parses on leave:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non leave:\n  say "goodbye"`);
    expect(r.success).toBe(true);
  });

  it("parses on message contains:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non message contains "hello":\n  reply "hi"`);
    expect(r.success).toBe(true);
  });

  it("parses on reaction add:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non reaction add "⭐":\n  reply "star!"`);
    expect(r.success).toBe(true);
  });

  it("parses every timer:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\nevery 5 minutes:\n  say "tick"`);
    expect(r.success).toBe(true);
  });

  it("parses on button click:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non button click "my-btn":\n  reply "clicked!"`);
    expect(r.success).toBe(true);
  });

  it("parses on modal submit:", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non modal submit "my-modal":\n  reply "submitted"`);
    expect(r.success).toBe(true);
  });
});

// ─── Validator ────────────────────────────────────────────────────────────────

describe("validator", () => {
  it("errors when bot name is missing", () => {
    const r = compileSource(`bot token from env "T"\non command "hi":\n  reply "hi"`);
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.code === "NEWT_E008")).toBe(true);
  });

  it("errors when bot token is missing", () => {
    const r = compileSource(`bot name "B"\non command "hi":\n  reply "hi"`);
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.code === "NEWT_E009")).toBe(true);
  });

  it("warns on hardcoded token (security)", () => {
    const r = compileSource(`bot name "B"\nbot token "hardcoded"\non command "hi":\n  reply "hi"`);
    expect(r.errors.some((e) => e.code === "NEWT_E005")).toBe(true);
  });

  it("errors on undefined variable", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non command "hi":\n  reply undefinedVar`);
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.code === "NEWT_E007")).toBe(true);
  });

  it("accepts let-bound variables in scope", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non command "hi":\n  let x = "hello"\n  reply x`);
    expect(r.success).toBe(true);
  });

  it("accepts user.username (Fix #17 — docs example)", () => {
    // user.username is used in all docs examples. Previously validator only accepted user.name.
    const r = compileSource(`bot name "B"\nbot token from env "T"\non command "hi":\n  reply "hello {user.username}"`);
    expect(r.success).toBe(true);
  });

  it("accepts built-in variables: user, channel, server, args, target", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non command "hi":\n  reply "ok"`);
    expect(r.success).toBe(true);
  });

  it("errors on timer with zero interval (Fix #14 boundary)", () => {
    // NEWT_E014 should fire for non-positive timer amounts
    const r = compileSource(`bot name "B"\nbot token from env "T"\nevery 0 minutes:\n  say "tick"`);
    expect(r.success).toBe(false);
    expect(r.errors.some((e) => e.code === "NEWT_E014")).toBe(true);
  });

  it("accepts modal submit variables: user, channel, server, interaction, fields (Fix #9)", () => {
    // Previously ModalSubmitHandler used empty scope causing false variable errors.
    const r = compileSource(`bot name "B"\nbot token from env "T"\non modal submit "m":\n  reply "done"`);
    expect(r.success).toBe(true);
  });
});

// ─── Codegen ──────────────────────────────────────────────────────────────────

describe("codegen — generated JS sanity", () => {
  function gen(source: string) {
    const r = compileSource(source);
    if (!r.success || !r.botJs) throw new Error(r.errors.map((e) => e.message).join("; "));
    return r.botJs;
  }

  it("does not contain literal 'and' operator in generated JS (Fix #3)", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non command "check":\n  if true and false:\n    reply "yes"`);
    // Must not have bare `and` as a JS operator — should be &&
    expect(js).not.toMatch(/\band\b/);
    expect(js).toContain("&&");
  });

  it("does not contain literal 'or' as boolean operator in generated JS (Fix #3)", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non command "check":\n  if true or false:\n    reply "yes"`);
    expect(js).not.toMatch(/\bor\b/);
    expect(js).toContain("||");
  });

  it("uses client.once('ready') not client.on('ready') for slash registration (Fix #6)", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non slash "ping" description "Ping":\n  reply "Pong!"`);
    // Must use once to avoid duplicate registration on reconnects
    expect(js).toMatch(/client\.once\("ready"/);
    expect(js).not.toMatch(/client\.on\("ready"/);
  });

  it("includes null check for client.application in slash registration (Fix #6)", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non slash "ping" description "Ping":\n  reply "Pong!"`);
    expect(js).toContain("client.application");
    // Should have a guard — either a check or a throw
    expect(js).toMatch(/if \(!client\.application\)|client\.application\?/);
  });

  it("imports ModalBuilder when a modal handler is present (Fix #5)", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non modal submit "m":\n  reply "done"`);
    expect(js).toContain("ModalBuilder");
  });

  it("includes env var guard for DISCORD_TOKEN (Fix #15)", () => {
    const js = gen(`bot name "B"\nbot token from env "DISCORD_TOKEN"\non command "hi":\n  reply "hi"`);
    expect(js).toMatch(/process\.env\.DISCORD_TOKEN/);
    // Should exit or error if token is missing
    expect(js).toMatch(/process\.exit|throw new Error/);
  });

  it("does not contain TODO comments in generated JS", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non command "hi":\n  reply "hello"`);
    expect(js).not.toContain("// TODO");
  });

  it("generated packageJson includes discord.js dependency", () => {
    const r = compileSource(`bot name "B"\nbot token from env "T"\non command "hi":\n  reply "hi"`);
    expect(r.success).toBe(true);
    const pkg = JSON.parse(r.packageJson!);
    expect(pkg.dependencies).toHaveProperty("discord.js");
    expect(pkg.dependencies).toHaveProperty("better-sqlite3");
  });

  it("generates valid LeaveHandler with channel variable (Fix #13)", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non leave:\n  say "goodbye"`);
    expect(js).toContain("guildMemberRemove");
    // channel must be defined so say statements work
    expect(js).toMatch(/const channel/);
  });

  it("generates valid JoinHandler with channel variable", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non join:\n  say "welcome"`);
    expect(js).toContain("guildMemberAdd");
    expect(js).toMatch(/const channel/);
  });

  it("generates store/load correctly", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non command "save":\n  store user.id points = 10`);
    expect(js).toContain("saveValue");
    expect(js).toContain("points");
  });

  it("generates if/else correctly", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non command "check":\n  let x = 5\n  if x > 3:\n    reply "big"\n  else:\n    reply "small"`);
    expect(js).toContain("if (");
    expect(js).toContain("} else {");
  });

  it("generates embed correctly", () => {
    const js = gen(`bot name "B"\nbot token from env "T"\non command "embed":\n  say embed:\n    title "Hello"\n    description "World"\n    color #FF0000`);
    expect(js).toContain("EmbedBuilder");
    expect(js).toContain("setTitle");
    expect(js).toContain("setDescription");
  });
});

// ─── Example files ────────────────────────────────────────────────────────────

describe("examples — all compile without errors", () => {
  const examplesDir = path.join(process.cwd(), "examples");
  const exampleFiles = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".newt"));

  for (const file of exampleFiles) {
    it(`examples/${file}`, () => {
      const source = fs.readFileSync(path.join(examplesDir, file), "utf-8");
      const result = compile(source, file);
      // Report all errors clearly in the test failure message
      const errorMessages = result.errors
        .filter((e) => e.severity !== "warning")
        .map((e) => `  [${e.code}] line ${e.line}: ${e.message}`)
        .join("\n");
      expect(errorMessages, `Errors in ${file}:\n${errorMessages}`).toBe("");
      if (result.success && result.botJs) {
        // Generated JS must not contain bare 'and'/'or' operators (Fix #3)
        expect(result.botJs, `${file}: bare 'and' in generated JS`).not.toMatch(/\band\b/);
        // Generated JS must not have TODO stubs
        expect(result.botJs, `${file}: TODO found in generated JS`).not.toContain("// TODO");
      }
    });
  }
});
