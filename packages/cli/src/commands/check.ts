import { compile } from "@newt-dev/compiler";
import { printErrors, readSource } from "../util.js";

export function checkCommand(file: string): number {
  const { filename, source } = readSource(file);
  const result = compile(source, filename);

  if (!result.success) {
    printErrors(result.errors, source);
    return 1;
  }

  console.log(`OK ${file} - no errors found`);
  return 0;
}
