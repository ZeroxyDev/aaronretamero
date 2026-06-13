import fs from "node:fs";

function parseFrontmatterValue(rawValue: string): string | string[] | number | boolean {
  const value = rawValue.trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^"(.*)"$/, "$1"))
      .filter(Boolean);
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value.replace(/^"(.*)"$/, "$1");
}

export function readContentFile(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

export function parseContentDocument<TFrontmatter extends Record<string, unknown>>(fileContent: string) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error("Invalid content frontmatter.");
  }

  const [, frontmatterBlock, content] = match;
  const frontmatter = Object.fromEntries(
    frontmatterBlock
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
          throw new Error(`Invalid frontmatter line: ${line}`);
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1);
        return [key, parseFrontmatterValue(value)];
      }),
  ) as TFrontmatter;

  return {
    frontmatter,
    content: content.trim(),
  };
}
