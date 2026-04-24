import { existsSync, mkdirSync } from "node:fs";

const PRODUCTION_RUNTIME_ROOT = "/var/lib/opctest";
const NON_PRODUCTION_RUNTIME_ROOT = "/tmp/opctest";

let runtimeRootOverride: string | null = null;

export function setRuntimeRootForTests(root: string | null) {
  runtimeRootOverride = root;
}

export function getRuntimeRoot() {
  if (runtimeRootOverride) {
    return runtimeRootOverride;
  }

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_RUNTIME_ROOT
    : NON_PRODUCTION_RUNTIME_ROOT;
}

export function runtimePath(...parts: string[]) {
  return [getRuntimeRoot(), ...parts]
    .filter((part) => part.length > 0)
    .join("/")
    .replace(/\/+/g, "/");
}

export function ensureRuntimeDir(...parts: string[]) {
  const dir = runtimePath(...parts);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}
