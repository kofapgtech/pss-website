import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readCollection<T>(name: string): T[] {
  try {
    const raw = fs.readFileSync(filePath(name), "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeCollection<T>(name: string, items: T[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(items, null, 2) + "\n", "utf-8");
}

export function newId(): string {
  return crypto.randomUUID();
}
