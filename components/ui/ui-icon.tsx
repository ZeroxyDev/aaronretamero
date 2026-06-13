"use client";

import type { CSSProperties } from "react";
import { Icon, addCollection } from "@iconify/react";
import { icons as solarIcons } from "@iconify-json/solar";
import type { IconName } from "@/components/ui/icons";

export type UiIconProps = {
  icon: IconName;
  className?: string;
  height?: string | number;
  width?: string | number;
  style?: CSSProperties;
};

addCollection(solarIcons);

export function UiIcon(props: UiIconProps) {
  return <Icon aria-hidden="true" {...props} />;
}
