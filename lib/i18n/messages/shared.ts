import "server-only";

export type MessageValue =
  | string
  | number
  | boolean
  | null
  | MessageValue[]
  | MessageDictionary;

export type MessageDictionary = {
  [key: string]: MessageValue;
};

export type MessageModule = {
  default: MessageDictionary;
};

function isMessageDictionary(value: MessageValue): value is MessageDictionary {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergePair(
  base: MessageDictionary,
  incoming: MessageDictionary,
): MessageDictionary {
  const result: MessageDictionary = {...base};

  for (const [key, value] of Object.entries(incoming)) {
    const previousValue = result[key];

    if (isMessageDictionary(previousValue) && isMessageDictionary(value)) {
      result[key] = mergePair(previousValue, value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function mergeMessages(
  ...dictionaries: readonly MessageDictionary[]
): MessageDictionary {
  return dictionaries.reduce<MessageDictionary>(
    (accumulator, dictionary) => mergePair(accumulator, dictionary),
    {},
  );
}

export function nestMessages(
  namespace: string,
  dictionary: MessageDictionary,
): MessageDictionary {
  return namespace
    .split(".")
    .reverse()
    .reduce<MessageDictionary>(
      (accumulator, segment) => ({[segment]: accumulator}),
      dictionary,
    );
}
