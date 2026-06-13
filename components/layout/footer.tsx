import { icons } from "@/components/ui/icons";
import { UiIcon } from "@/components/ui/ui-icon";

type FooterProps = {
  handle: string;
  name: string;
  profileUrl: string;
  sourceLabel: string;
  sourceUrl: string;
  text: string;
};

export function Footer({ handle, name, profileUrl, sourceLabel, sourceUrl, text }: FooterProps) {
  return (
    <footer className="mt-20 pb-4 pt-16">
      <div className="flex items-baseline justify-between gap-6 text-sm tracking-[-0.01em] text-muted">
        <p>
          {name}{" "}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            ({handle})
          </a>
        </p>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <p className="text-right">{text}</p>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-ink"
          >
            <UiIcon icon={icons.code} className="size-4 shrink-0" />
            <span>{sourceLabel}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
