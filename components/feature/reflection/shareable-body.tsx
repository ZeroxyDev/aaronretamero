"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Markdown } from "@/lib/markdown";

type ShareableBodyProps = {
  content: string;
  reflectionTitle: string;
  footerTitle: string;
  footerMeta: string;
  siteDomain: string;
  shareLabel: string;
  shareFallbackLabel: string;
  copiedLabel: string;
  downloadLabel: string;
  selectionHint: string;
};

type SelectionState = {
  text: string;
  before: string;
  after: string;
  x: number;
  y: number;
};

type TextToken = {
  highlighted: boolean;
  text: string;
};

type TextLine = {
  tokens: TextToken[];
  width: number;
};

const MIN_SELECTION_LENGTH = 12;
const CONTEXT_CHARACTERS = 120;
const CONTEXT_LOOKAROUND_CHARACTERS = 420;
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const CARD_PADDING_X = 116;
const CARD_TOP = 240;
const CARD_BOTTOM = 180;
const FOOTER_GAP = 170;
const POPOVER_WIDTH = 248;
const POPOVER_HEIGHT = 64;
const VIEWPORT_MARGIN = 12;

export function ShareableBody({
  content,
  reflectionTitle,
  footerTitle,
  footerMeta,
  siteDomain,
  shareLabel,
  shareFallbackLabel,
  copiedLabel,
  downloadLabel,
  selectionHint,
}: ShareableBodyProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const proseRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const updateTimeoutRef = useRef<number | null>(null);
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  const resetSelection = useEffectEvent(() => {
    setSelectionState(null);
  });

  const updateSelection = useEffectEvent(() => {
    const root = rootRef.current;
    const prose = proseRef.current;
    const selection = window.getSelection();

    if (!root || !prose || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      resetSelection();
      return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const ancestorNode =
      commonAncestor.nodeType === Node.TEXT_NODE
        ? commonAncestor.parentNode
        : commonAncestor;

    if (!(ancestorNode instanceof Node) || !root.contains(ancestorNode)) {
      resetSelection();
      return;
    }

    const selectedText = selection.toString().replace(/\s+/g, " ").trim();

    if (selectedText.length < MIN_SELECTION_LENGTH) {
      resetSelection();
      return;
    }

    const articleText = prose.innerText.replace(/\s+/g, " ").trim();
    const startIndex = articleText.indexOf(selectedText);

    if (startIndex === -1) {
      resetSelection();
      return;
    }

    const endIndex = startIndex + selectedText.length;
    const rects = range.getClientRects();
    const lastRect = rects.item(rects.length - 1) ?? range.getBoundingClientRect();

    setSelectionState({
      text: selectedText,
      before: articleText
        .slice(Math.max(0, startIndex - CONTEXT_LOOKAROUND_CHARACTERS), startIndex)
        .trim(),
      after: articleText
        .slice(endIndex, Math.min(articleText.length, endIndex + CONTEXT_LOOKAROUND_CHARACTERS))
        .trim(),
      x: lastRect.right,
      y: lastRect.bottom,
    });
  });

  useEffect(() => {
    function queueSelectionUpdate() {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = window.setTimeout(() => {
        updateSelection();
      }, 40);
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (popoverRef.current?.contains(target)) {
        return;
      }

      if (rootRef.current?.contains(target)) {
        resetSelection();
      }
    }

    document.addEventListener("mouseup", queueSelectionUpdate);
    document.addEventListener("touchend", queueSelectionUpdate);
    document.addEventListener("keyup", queueSelectionUpdate);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", resetSelection);
    window.addEventListener("scroll", resetSelection, true);

    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }

      document.removeEventListener("mouseup", queueSelectionUpdate);
      document.removeEventListener("touchend", queueSelectionUpdate);
      document.removeEventListener("keyup", queueSelectionUpdate);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", resetSelection);
      window.removeEventListener("scroll", resetSelection, true);
    };
  }, []);

  useEffect(() => {
    if (!statusLabel) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusLabel(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusLabel]);

  async function handleShare() {
    if (!selectionState) {
      return;
    }

    try {
      const blob = await renderShareCard({
        footerTitle,
        footerMeta,
        siteDomain,
        before: selectionState.before,
        quote: selectionState.text,
        after: selectionState.after,
      });

      const file = new File([blob], `reflexion-${slugify(selectionState.text)}.png`, {
        type: "image/png",
      });

      if (
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: reflectionTitle,
          text: selectionState.text,
        });
        setStatusLabel(shareLabel);
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(objectUrl);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selectionState.text);
        setStatusLabel(copiedLabel);
      } else {
        setStatusLabel(downloadLabel);
      }
    } catch {
      setStatusLabel(shareFallbackLabel);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div ref={proseRef} className="reflection-prose">
        <Markdown content={content} />
      </div>

      {selectionState ? (
        <div
          className="pointer-events-none fixed z-30"
          style={{
            left: clamp(
              selectionState.x - POPOVER_WIDTH,
              VIEWPORT_MARGIN,
              window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN,
            ),
            top: clamp(
              selectionState.y + 12,
              VIEWPORT_MARGIN,
              window.innerHeight - POPOVER_HEIGHT - VIEWPORT_MARGIN,
            ),
          }}
        >
          <div
            ref={popoverRef}
            className="pointer-events-auto flex w-[15.5rem] items-center justify-between gap-3 rounded-[1.35rem] border border-white/10 bg-[color-mix(in_srgb,var(--color-surface)_78%,black)] px-2 py-2 text-sm text-ink shadow-[0_20px_60px_rgba(0,0,0,0.32)] ring-1 ring-black/10 backdrop-blur-2xl"
            onMouseDown={(event) => event.preventDefault()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="min-w-0 px-2">
              <p className="truncate text-[0.82rem] font-medium tracking-[-0.01em] text-ink">
                {statusLabel ?? shareLabel}
              </p>
              <p className="truncate text-[0.72rem] text-muted">{selectionHint}</p>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex shrink-0 items-center rounded-full bg-ink px-3 py-2 text-[0.78rem] font-medium text-canvas transition hover:opacity-90"
            >
              {shareLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function trimContext(value: string, fromStart: boolean) {
  if (!value) {
    return "";
  }

  const trimmed = value.replace(/\s+/g, " ").trim();

  if (trimmed.length <= CONTEXT_CHARACTERS) {
    return trimmed;
  }

  const words = trimmed.split(" ").filter(Boolean);

  if (fromStart) {
    let result = "";

    for (const word of words) {
      const candidate = result ? `${result} ${word}` : word;

      if (candidate.length > CONTEXT_CHARACTERS) {
        break;
      }

      result = candidate;
    }

    return `${result || words[0]}...`;
  }

  let result = "";

  for (let index = words.length - 1; index >= 0; index -= 1) {
    const candidate = result ? `${words[index]} ${result}` : words[index];

    if (candidate.length > CONTEXT_CHARACTERS) {
      break;
    }

    result = candidate;
  }

  return `...${result || words[words.length - 1]}`;
}

async function renderShareCard({
  footerTitle,
  footerMeta,
  siteDomain,
  before,
  quote,
  after,
}: {
  footerTitle: string;
  footerMeta: string;
  siteDomain: string;
  before: string;
  quote: string;
  after: string;
}) {
  const maxWidth = CARD_WIDTH - CARD_PADDING_X * 2;
  const beforeText = trimContext(before, false);
  const quoteText = quote;
  const afterText = trimContext(after, true);
  const textTokens = buildTextTokens(beforeText, quoteText, afterText);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas not available");
  }

  const footerTitleFontSize = 28;
  const footerBylineFontSize = 28;
  const footerDomainFontSize = 26;
  const availableHeight = CARD_HEIGHT - CARD_TOP - CARD_BOTTOM - FOOTER_GAP;
  const textLayout = fitTextLayout(context, textTokens, maxWidth, availableHeight);
  const textBlockHeight = textLayout.lines.length * textLayout.lineHeight;
  const startY = clamp(
    Math.round(CARD_TOP + (availableHeight - textBlockHeight) / 2),
    CARD_TOP,
    CARD_HEIGHT - CARD_BOTTOM - FOOTER_GAP - textBlockHeight,
  );

  context.fillStyle = "#1a1917";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const gradient = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, "rgba(248, 247, 244, 0.08)");
  gradient.addColorStop(0.5, "rgba(248, 247, 244, 0.03)");
  gradient.addColorStop(1, "rgba(248, 247, 244, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  drawStyledTextBlock(context, textLayout.lines, CARD_PADDING_X, startY, textLayout);

  context.filter = "none";
  const footerTitleY = CARD_HEIGHT - CARD_BOTTOM - 112;
  context.font = `500 ${footerTitleFontSize}px 'Site Font', sans-serif`;
  context.fillStyle = "rgba(173, 162, 139, 0.92)";
  context.fillText(footerTitle, CARD_PADDING_X, footerTitleY);

  const footerBylineY = footerTitleY + 54;
  context.font = `500 ${footerBylineFontSize}px 'Site Font', sans-serif`;
  context.fillStyle = "rgba(248, 247, 244, 0.97)";
  context.fillText(footerMeta, CARD_PADDING_X, footerBylineY);

  const footerDomainY = footerBylineY + 54;
  context.font = `500 ${footerDomainFontSize}px 'Site Font', sans-serif`;
  context.fillStyle = "rgba(173, 162, 139, 0.88)";
  context.fillText(siteDomain, CARD_PADDING_X, footerDomainY);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Unable to export image"));
    }, "image/png");
  });
}

function buildTextTokens(before: string, quote: string, after: string) {
  const tokens: TextToken[] = [];

  appendSegmentTokens(tokens, before, false);

  if (before && quote) {
    tokens.push({ highlighted: false, text: " " });
  }

  appendSegmentTokens(tokens, quote, true);

  if (quote && after) {
    tokens.push({ highlighted: false, text: " " });
  }

  appendSegmentTokens(tokens, after, false);

  return tokens;
}

function appendSegmentTokens(tokens: TextToken[], text: string, highlighted: boolean) {
  text
    .split(/(\s+)/)
    .filter(Boolean)
    .forEach((part) => {
      tokens.push({ highlighted, text: part });
    });
}

function fitTextLayout(
  context: CanvasRenderingContext2D,
  tokens: TextToken[],
  maxWidth: number,
  maxHeight: number,
) {
  for (let fontSize = 84; fontSize >= 42; fontSize -= 2) {
    const lineHeight = Math.round(fontSize * 1.26);
    const lines = layoutTextTokens(context, tokens, maxWidth, fontSize);

    if (lines.length * lineHeight <= maxHeight) {
      return { fontSize, lineHeight, lines };
    }
  }

  const fontSize = 42;
  return {
    fontSize,
    lineHeight: Math.round(fontSize * 1.26),
    lines: layoutTextTokens(context, tokens, maxWidth, fontSize),
  };
}

function layoutTextTokens(
  context: CanvasRenderingContext2D,
  tokens: TextToken[],
  maxWidth: number,
  fontSize: number,
) {
  context.font = `600 ${fontSize}px 'Site Font', sans-serif`;

  const lines: TextLine[] = [];
  let currentTokens: TextToken[] = [];
  let currentWidth = 0;

  tokens.forEach((token) => {
    const isWhitespace = /^\s+$/.test(token.text);

    if (isWhitespace && currentTokens.length === 0) {
      return;
    }

    const tokenWidth = context.measureText(token.text).width;

    if (!isWhitespace && currentTokens.length > 0 && currentWidth + tokenWidth > maxWidth) {
      lines.push(trimTrailingWhitespace(context, currentTokens));
      currentTokens = [];
      currentWidth = 0;
    }

    if (isWhitespace && currentTokens.length === 0) {
      return;
    }

    currentTokens.push(token);
    currentWidth += tokenWidth;
  });

  if (currentTokens.length > 0) {
    lines.push(trimTrailingWhitespace(context, currentTokens));
  }

  return lines;
}

function trimTrailingWhitespace(
  context: CanvasRenderingContext2D,
  tokens: TextToken[],
) {
  const trimmedTokens = [...tokens];

  while (trimmedTokens.length > 0 && /^\s+$/.test(trimmedTokens[trimmedTokens.length - 1].text)) {
    trimmedTokens.pop();
  }

  const width = trimmedTokens.reduce(
    (sum, token) => sum + context.measureText(token.text).width,
    0,
  );

  return { tokens: trimmedTokens, width };
}

function drawStyledTextBlock(
  context: CanvasRenderingContext2D,
  lines: TextLine[],
  x: number,
  startY: number,
  layout: { fontSize: number; lineHeight: number },
) {
  const baselineAdjustment = layout.fontSize;

  lines.forEach((line, index) => {
    let cursorX = x;
    const y = startY + index * layout.lineHeight + baselineAdjustment;

    line.tokens.forEach((token) => {
      context.font = `${token.highlighted ? 600 : 520} ${layout.fontSize}px 'Site Font', sans-serif`;
      context.filter = token.highlighted ? "none" : "blur(7px)";
      context.fillStyle = token.highlighted
        ? "rgba(248, 247, 244, 0.98)"
        : "rgba(173, 162, 139, 0.8)";
      context.fillText(token.text, cursorX, y);
      cursorX += context.measureText(token.text).width;
    });
  });
}
