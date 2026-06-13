import fs from "node:fs";
import path from "node:path";

function parseEnvAssignment(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
  const separatorIndex = normalized.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = normalized.slice(0, separatorIndex).trim();
  const rawValue = normalized.slice(separatorIndex + 1).trim();
  const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");

  if (!key) {
    return null;
  }

  return { key, value };
}

export function loadLocalEnvFiles() {
  [".env.local", ".env"].forEach((fileName) => {
    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      return;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    fileContent.split("\n").forEach((line) => {
      const assignment = parseEnvAssignment(line);

      if (!assignment) {
        return;
      }

      if (process.env[assignment.key] === undefined) {
        process.env[assignment.key] = assignment.value;
      }
    });
  });
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim().replace(/^"|"$/g, "");

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}
