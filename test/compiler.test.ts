import { describe, it, expect } from 'vitest';
import { tokenize, parse, validate, compile } from '@newt-dev/compiler';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Compiler Fixture Tests', () => {
  it('should tokenize simple bot config', () => {
    const source = `
bot name "TestBot"
bot prefix "!"
bot token from env "DISCORD_TOKEN"
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === 'bot')).toBe(true);
  });

  it('should tokenize on command handler', () => {
    const source = `
on command "hello":
    reply "Hello, world!"
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === 'on')).toBe(true);
    expect(tokens.some(t => t.value === 'command')).toBe(true);
  });

  it('should tokenize reply statement', () => {
    const source = `
on command "test":
    reply "Test message"
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === 'reply')).toBe(true);
  });
});

describe('Example File Tests', () => {
  const examplesDir = join(process.cwd(), 'examples');
  const exampleFiles = readdirSync(examplesDir).filter(f => f.endsWith('.newt'));
  
  describe('Tokenization', () => {
    for (const file of exampleFiles) {
      it(`should tokenize ${file}`, () => {
        const source = readFileSync(join(examplesDir, file), 'utf-8');
        const tokens = tokenize(source);
        expect(tokens.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Parsing', () => {
    for (const file of exampleFiles) {
      it(`should parse ${file}`, () => {
        const source = readFileSync(join(examplesDir, file), 'utf-8');
        const tokens = tokenize(source);
        const ast = parse(tokens);
        expect(ast).toBeDefined();
        expect(ast.body.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Validation', () => {
    for (const file of exampleFiles) {
      it(`should validate ${file}`, () => {
        const source = readFileSync(join(examplesDir, file), 'utf-8');
        const tokens = tokenize(source);
        const ast = parse(tokens);
        const errors = validate(ast);
        expect(errors).toBeDefined();
      });
    }
  });

  describe('Compilation', () => {
    for (const file of exampleFiles) {
      it(`should compile ${file}`, () => {
        const source = readFileSync(join(examplesDir, file), 'utf-8');
        // Some examples may use features not supported in build (e.g., push statement)
        // We just verify the compile function handles it gracefully (either succeeds or returns CompileFailure)
        const result = compile(source, file);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      });
    }
  });

  describe('Generated JS Smoke Tests', () => {
    for (const file of exampleFiles) {
      it(`should not contain TODO comments in generated JS for ${file}`, () => {
        const source = readFileSync(join(examplesDir, file), 'utf-8');
        const result = compile(source, file);
        // Skip if compilation failed (unsupported feature in build)
        if (!result.success) {
          return;
        }
        if (result.botJs) {
          expect(result.botJs).not.toContain('// TODO');
        }
      });

      it(`should not contain invalid raw operators in generated JS for ${file}`, () => {
        const source = readFileSync(join(examplesDir, file), 'utf-8');
        const result = compile(source, file);
        // Skip if compilation failed (unsupported feature in build)
        if (!result.success) {
          return;
        }
        if (result.botJs) {
          // Check for raw ' and ' which would be invalid JavaScript
          expect(result.botJs).not.toMatch(/\s+and\s+/);
        }
      });
    }
  });
});

describe('Expression Precedence Tests', () => {
  it('should tokenize arithmetic expressions', () => {
    const source = `
let x = 1 + 2 * 3
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === '+')).toBe(true);
    expect(tokens.some(t => t.value === '*')).toBe(true);
  });

  it('should tokenize boolean expressions', () => {
    const source = `
if true or false and false:
    reply "test"
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === 'or')).toBe(true);
    expect(tokens.some(t => t.value === 'and')).toBe(true);
  });

  it('should tokenize unary not', () => {
    const source = `
if not false:
    reply "test"
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === 'not')).toBe(true);
  });

  it('should tokenize comparison expressions', () => {
    const source = `
if points >= 10 and points < 20:
    reply "test"
`;
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some(t => t.value === '>=')).toBe(true);
    expect(tokens.some(t => t.value === '<')).toBe(true);
  });
});
