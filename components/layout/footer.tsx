type FooterProps = {
  handle: string;
  name: string;
  profileUrl: string;
  text: string;
};

export function Footer({ handle, name, profileUrl, text }: FooterProps) {
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
        <p className="text-right">{text}</p>
      </div>
    </footer>
  );
}
