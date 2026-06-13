import { ShareableBody } from "@/components/feature/reflection/shareable-body";

type BodyProps = {
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

export function Body(props: BodyProps) {
  return (
    <div className="mt-8">
      <ShareableBody {...props} />
    </div>
  );
}
