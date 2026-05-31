import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { buildCommand } from "./build.js";

export interface RunOptions {
  safe?: boolean;
}

export function runCommand(file: string, options: RunOptions = {}): number {
  if (!process.env.DISCORD_TOKEN) {
    console.error("DISCORD_TOKEN is not set. Newt bots read tokens from the environment by default.");
    return 1;
  }

  const outDir = mkdtempSync(join(tmpdir(), "newt-run-"));
  const built = buildCommand(file, { outDir });
  if (built !== 0) {
    rmSync(outDir, { recursive: true, force: true });
    return built;
  }

  console.log("Installing generated bot dependencies...");
  const install = spawnSync("npm.cmd", ["install", "--omit=dev"], { cwd: outDir, stdio: "inherit", shell: false });
  if (install.status !== 0) {
    return install.status ?? 1;
  }

  console.log("Starting Newt bot...");
  const child = spawnSync("node", ["bot.js"], {
    cwd: outDir,
    stdio: "inherit",
    env: { ...process.env, NEWT_SAFE_MODE: options.safe ? "1" : process.env.NEWT_SAFE_MODE ?? "" }
  });

  return child.status ?? 0;
}
