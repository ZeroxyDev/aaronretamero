import { ShareableBody } from "@/components/feature/reflection/shareable-body";
import { Markdown } from "@/lib/markdown";

type BaseBodyProps = {
  content: string;
};

type ShareBodyProps = BaseBodyProps & {
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

type BodyProps = BaseBodyProps | ShareBodyProps;

export function Body(props: BodyProps) {
  if (!("shareLabel" in props)) {
    return (
      <div className="mt-8">
        <Markdown content={props.content} />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <ShareableBody {...props} />
    </div>
  );
}
