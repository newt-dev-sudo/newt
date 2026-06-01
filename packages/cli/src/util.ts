import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { formatError, type NewtError } from "@newt-dev/compiler";

export function readSource(file: string): { filename: string; source: string } {
  const filename = resolve(file);
  if (!existsSync(filename)) {
    throw new Error(`I could not find ${file}. Check the path and try again.`);
  }

  return { filename, source: readFileSync(filename, "utf8") };
}

export function printErrors(errors: NewtError[], source: string): void {
  for (const error of errors) {
    console.error(`${formatError(error, source)}\n`);
  }
}

export function writeProject(outDir: string, botJs: string, packageJson: string): void {
  const target = resolve(outDir);
  mkdirSync(target, { recursive: true });
  writeFileSync(resolve(target, "bot.js"), botJs);
  writeFileSync(resolve(target, "package.json"), packageJson);
}

export function writeTextFile(path: string, text: string): void {
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), text);
}
