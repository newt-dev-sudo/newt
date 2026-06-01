import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { compile, formatError } from "../packages/compiler/dist/src/index.js";

const example = process.argv[2] ?? "examples/hello-world.newt";
const installDeps = process.argv.includes("--install");
const runBot = process.argv.includes("--run");
const sourcePath = resolve(example);
const outDir = resolve(".tmp/runtime-smoke");

if (!existsSync(sourcePath)) {
  console.error(`Could not find ${example}`);
  process.exit(1);
}

const source = readFileSync(sourcePath, "utf8");
const result = compile(source, example);
if (!result.success) {
  for (const error of result.errors) {
    console.error(`${formatError(error, source)})}\n`);
  }
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "bot.js"), result.botJs);
writeFileSync(resolve(outDir, "package.json"), result.packageJson);

console.log(`Generated bot project: ${outDir}`);

const syntax = spawnSync("node", ["--check", "bot.js"], { cwd: outDir, stdio: "inherit" });
if (syntax.status !== 0) {
  process.exit(syntax.status ?? 1);
}

if (installDeps) {
  const install = spawnSync("npm.cmd", ["install"], { cwd: outDir, stdio: "inherit" });
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

if (runBot) {
  if (!process.env.DISCORD_TOKEN) {
    console.error("DISCORD_TOKEN is required for --run.");
    process.exit(1);
  }

  const bot = spawnSync("node", ["bot.js"], {
    cwd: outDir,
    stdio: "inherit",
    env: process.env
  });
  process.exit(bot.status ?? 0);
}

console.log("Runtime smoke generation passed.");
console.log("Next live test: npm run verify:runtime -- examples/hello-world.newt --install --run");
