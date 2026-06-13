import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  content: string;
};

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 className="mt-8 text-2xl font-medium tracking-[-0.03em] text-ink">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-10 text-xl font-medium tracking-[-0.02em] text-ink">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-6 max-w-none text-[1.08rem] leading-[1.95] tracking-[-0.01em] text-ink/88">
            {children}
          </p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-ink underline decoration-border underline-offset-4"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="mt-6 list-disc space-y-2 pl-5 text-ink/88">{children}</ul>,
        ol: ({ children }) => (
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-ink/88">{children}</ol>
        ),
        li: ({ children }) => <li className="pl-1 text-[1.02rem] leading-8">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="mt-8 border-l border-border pl-4 text-muted">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="mt-10 border-0 border-t border-border" />,
        strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
        em: ({ children }) => <em className="italic text-ink/82">{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
