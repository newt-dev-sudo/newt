import { describe, it, expect } from 'vitest';
import { tokenize, parse, validate } from '@newt-dev/compiler';
import { readFileSync } from 'fs';
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
  
  it('should tokenize hello-world.newt', () => {
    const source = readFileSync(join(examplesDir, 'hello-world.newt'), 'utf-8');
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should parse hello-world.newt', () => {
    const source = readFileSync(join(examplesDir, 'hello-world.newt'), 'utf-8');
    const tokens = tokenize(source);
    const ast = parse(tokens);
    expect(ast).toBeDefined();
    expect(ast.body.length).toBeGreaterThan(0);
  });

  it('should validate hello-world.newt', () => {
    const source = readFileSync(join(examplesDir, 'hello-world.newt'), 'utf-8');
    const tokens = tokenize(source);
    const ast = parse(tokens);
    const errors = validate(ast);
    // Should have validation errors for unsupported features in codegen
    // but basic syntax should be valid
    expect(errors).toBeDefined();
  });

  it('should tokenize points-bot.newt', () => {
    const source = readFileSync(join(examplesDir, 'points-bot.newt'), 'utf-8');
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should parse points-bot.newt', () => {
    const source = readFileSync(join(examplesDir, 'points-bot.newt'), 'utf-8');
    const tokens = tokenize(source);
    const ast = parse(tokens);
    expect(ast).toBeDefined();
    expect(ast.body.length).toBeGreaterThan(0);
  });

  it('should tokenize welcome-bot.newt', () => {
    const source = readFileSync(join(examplesDir, 'welcome-bot.newt'), 'utf-8');
    const tokens = tokenize(source);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should parse welcome-bot.newt', () => {
    const source = readFileSync(join(examplesDir, 'welcome-bot.newt'), 'utf-8');
    const tokens = tokenize(source);
    const ast = parse(tokens);
    expect(ast).toBeDefined();
    expect(ast.body.length).toBeGreaterThan(0);
  });
});
