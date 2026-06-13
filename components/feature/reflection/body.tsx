import { Markdown } from "@/lib/markdown";

type BodyProps = {
  content: string;
};

export function Body({ content }: BodyProps) {
  return (
    <div className="mt-8">
      <Markdown content={content} />
    </div>
  );
}
