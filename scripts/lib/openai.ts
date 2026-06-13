import { getRequiredEnv } from "./env";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";

type ResponsesApiOutput = {
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
  output_text?: string;
};

function getTranslationModel() {
  return process.env.OPENAI_TRANSLATION_MODEL?.trim().replace(/^"|"$/g, "") || "gpt-5-mini";
}

function getResponseText(payload: ResponsesApiOutput) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return text;
}

function extractJsonCandidate(value: string) {
  const fencedMatch = value.match(/```(?:json)?\n([\s\S]*?)\n```/);
  const candidate = fencedMatch ? fencedMatch[1] : value;
  const objectStart = candidate.indexOf("{");
  const objectEnd = candidate.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return candidate.slice(objectStart, objectEnd + 1);
  }

  return candidate;
}

function repairInvalidJsonEscapes(value: string) {
  let result = "";
  let index = 0;
  let inString = false;

  while (index < value.length) {
    const char = value[index];

    if (char === '"' && value[index - 1] !== "\\") {
      inString = !inString;
      result += char;
      index += 1;
      continue;
    }

    if (inString && char === "\\") {
      const next = value[index + 1];

      if (next === undefined) {
        result += "\\\\";
        index += 1;
        continue;
      }

      if (next === "u") {
        const unicodeDigits = value.slice(index + 2, index + 6);

        if (/^[0-9a-fA-F]{4}$/.test(unicodeDigits)) {
          result += value.slice(index, index + 6);
          index += 6;
          continue;
        }
      }

      if (!`"\\/bfnrtu`.includes(next)) {
        result += "\\\\";
        index += 1;
        continue;
      }
    }

    result += char;
    index += 1;
  }

  return result;
}

function extractJsonObject<T>(value: string) {
  const candidate = extractJsonCandidate(value).trim();

  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    const repairedCandidate = repairInvalidJsonEscapes(candidate);

    try {
      return JSON.parse(repairedCandidate) as T;
    } catch {
      const message = error instanceof Error ? error.message : "Unknown JSON parse error.";
      throw new Error(
        `Unable to parse OpenAI JSON response. ${message}\n\nResponse preview:\n${candidate.slice(0, 1200)}`,
      );
    }
  }
}

export async function requestOpenAiJson<T>(prompt: string): Promise<T> {
  const apiKey = getRequiredEnv("OPENAI_KEY");
  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getTranslationModel(),
      input: prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as ResponsesApiOutput;
  return extractJsonObject<T>(getResponseText(payload));
}
