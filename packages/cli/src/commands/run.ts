import { compile } from "@newt-dev/compiler";
import { printErrors, readSource } from "../util.js";
import { getToken, setToken } from "../token-store.js";
import { NewtInterpreter } from "../interpreter.js";

export interface RunOptions {
  safe?: boolean;
}

export async function runCommand(file: string, options: RunOptions = {}): Promise<number> {
  const { filename, source } = readSource(file);
  const result = compile(source, filename);

  if (!result.success) {
    printErrors(result.errors, source);
    return 1;
  }

  // Check for token
  let token = getToken();
  if (!token) {
    console.log("No Discord token found. Please enter your bot token:");
    console.log("(You can get this from https://discord.com/developers/applications)");
    console.log("Or use: newt token <your-token>");
    return 1;
  }

  // Run interpreter
  const interpreter = new NewtInterpreter({
    token,
    program: result.program
  });

  try {
    await interpreter.run();
    return 0;
  } catch (error) {
    console.error("Bot error:", (error as Error).message);
    return 1;
  }
}
