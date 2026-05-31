import { generate, type GeneratedProject } from "./codegen.js";
import { formatError, NewtError } from "./errors.js";
import { tokenize } from "./lexer.js";
import { parse } from "./parser.js";
import { validate } from "./validator.js";

export interface CompileSuccess extends GeneratedProject {
  success: true;
}

export interface CompileFailure {
  success: false;
  errors: NewtError[];
}

export type CompileResult = CompileSuccess | CompileFailure;

export function compile(source: string, filename = "input.newt"): CompileResult {
  try {
    const tokens = tokenize(source);
    const program = parse(tokens);
    const errors = validate(program, source).map((error) => {
      if (!error.filename) {
        return new NewtError({ ...error, filename });
      }
      return error;
    });

    const fatalErrors = errors.filter((error) => error.severity === "error");
    if (fatalErrors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, ...generate(program) };
  } catch (error) {
    if (error instanceof NewtError) {
      return { success: false, errors: [new NewtError({ ...error, filename })] };
    }
    throw error;
  }
}

export { generate } from "./codegen.js";
export { formatError, NewtError } from "./errors.js";
export { tokenize, type Token, type TokenType } from "./lexer.js";
export { parse } from "./parser.js";
export { validate } from "./validator.js";
export type * from "./ast.js";
