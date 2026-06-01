import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

interface Config {
  token?: string;
}

function getConfigPath(): string {
  const platform = process.platform;
  let configDir: string;

  if (platform === "win32") {
    configDir = join(process.env.APPDATA || homedir(), "newt");
  } else {
    configDir = join(homedir(), ".config", "newt");
  }

  return join(configDir, "config.json");
}

function ensureConfigDir(): void {
  const configPath = getConfigPath();
  const configDir = dirname(configPath);
  
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

function readConfig(): Config {
  const configPath = getConfigPath();
  
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const content = readFileSync(configPath, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function writeConfig(config: Config): void {
  ensureConfigDir();
  const configPath = getConfigPath();
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

export function getToken(): string | null {
  const config = readConfig();
  return config.token || null;
}

export function setToken(token: string): void {
  const config = readConfig();
  config.token = token;
  writeConfig(config);
}

export function clearToken(): void {
  const config = readConfig();
  delete config.token;
  writeConfig(config);
}

export function hasToken(): boolean {
  return getToken() !== null;
}
