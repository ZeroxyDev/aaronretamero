export const icons = {
  arrowLeft: "solar:alt-arrow-left-linear",
  arrowRight: "solar:alt-arrow-right-linear",
  code: "solar:code-square-linear",
  globe: "solar:global-linear",
  pin: "solar:pin-bold-duotone",
} as const;

export type IconName = (typeof icons)[keyof typeof icons];
