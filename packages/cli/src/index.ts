#!/usr/bin/env node
import { buildCommand } from "./commands/build.js";
import { checkCommand } from "./commands/check.js";
import { deployCommand } from "./commands/deploy.js";
import { newCommand } from "./commands/new.js";
import { runCommand } from "./commands/run.js";

// Check Node.js version (requires 18+ for native fetch)
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error(`Error: Newt requires Node.js 18 or higher. You are running Node.js ${nodeVersion}.`);
  console.error('Please upgrade Node.js: https://nodejs.org/');
  process.exit(1);
}

const [, , command, ...args] = process.argv;

function help(): void {
  console.log(`Newt CLI

Usage:
  newt check <file>
  newt build <file> [--out <dir>]
  newt run <file> [--safe]
  newt new [name] [--template hello|welcome|points|blank]
  newt deploy <file>
`);
}

function optionValue(flag: string, fallback?: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
}

try {
  let exitCode = 0;
  if (!command || command === "--help" || command === "-h") {
    help();
  } else if (command === "check") {
    exitCode = args[0] ? checkCommand(args[0]) : missingFile();
  } else if (command === "build") {
    exitCode = args[0] ? buildCommand(args[0], { outDir: optionValue("--out") }) : missingFile();
  } else if (command === "run") {
    exitCode = args[0] ? runCommand(args[0], { safe: args.includes("--safe") }) : missingFile();
  } else if (command === "new") {
    exitCode = newCommand(args[0], optionValue("--template", "hello"));
  } else if (command === "deploy") {
    exitCode = args[0] ? deployCommand(args[0]) : missingFile();
  } else {
    console.error(`Unknown command: ${command}`);
    help();
    exitCode = 1;
  }
  process.exitCode = exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function missingFile(): number {
  console.error("Please pass a .newt file.");
  return 1;
}
