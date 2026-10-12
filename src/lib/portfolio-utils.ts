import { existsSync } from "node:fs";
import { join } from "node:path";

export function safeEmail(email: string): string | null {
  const value = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  if (/example\.(com|net|org)|your\.email|placeholder/i.test(value)) return null;
  return value;
}

export function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (/^example\.(com|net|org)$/.test(url.hostname) || /your-username|placeholder/i.test(value)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function hasLocalPublicFile(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  const filename = path.slice(1);
  if (!filename || filename.split("/").some((part) => part === ".." || part === ".")) return false;
  return existsSync(join(process.cwd(), "public", filename));
}

export function safeLocalAsset(candidate: string, fallback: string): string {
  return hasLocalPublicFile(candidate) ? candidate : fallback;
}
