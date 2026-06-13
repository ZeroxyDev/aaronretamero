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

function extractJsonObject<T>(value: string) {
  const fencedMatch = value.match(/```(?:json)?\n([\s\S]*?)\n```/);
  const candidate = fencedMatch ? fencedMatch[1] : value;
  return JSON.parse(candidate) as T;
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
