import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9.2 6.75 4 12l5.2 5.25" />
      <path d="M20 12H4.4" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14.8 6.75 20 12l-5.2 5.25" />
      <path d="M4 12h15.6" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9.5h16.8" />
      <path d="M3.6 14.5h16.8" />
      <path d="M12 3c2.4 2.35 3.75 5.7 3.75 9S14.4 18.65 12 21" />
      <path d="M12 3C9.6 5.35 8.25 8.7 8.25 12S9.6 18.65 12 21" />
    </svg>
  );
}
