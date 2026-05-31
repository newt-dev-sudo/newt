import { relative, resolve } from "node:path";
import { compile } from "@newt-lang/compiler";
import { printErrors, readSource, writeProject } from "../util.js";

export interface BuildOptions {
  outDir?: string;
}

export function buildCommand(file: string, options: BuildOptions = {}): number {
  const { filename, source } = readSource(file);
  const result = compile(source, filename);

  if (!result.success) {
    printErrors(result.errors, source);
    return 1;
  }

  const outDir = options.outDir ?? "dist";
  writeProject(outDir, result.botJs, result.packageJson);
  const display = relative(process.cwd(), resolve(outDir)) || ".";
  console.log(`OK Built to ${display}`);
  console.log(`Next: cd ${display} && npm install && DISCORD_TOKEN=... npm start`);
  return 0;
}
