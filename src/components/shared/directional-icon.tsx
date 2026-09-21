import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DirectionalIconProps extends LucideProps {
  icon: LucideIcon;
  /**
   * If true (default), the icon rotates 180 degrees in RTL mode.
   * Useful for forward arrows (ArrowRight, ChevronRight) to point left in RTL.
   */
  mirror?: boolean;
}

/**
 * DirectionalIcon component
 * Automatically flips directional icons (e.g. arrows, chevrons) in RTL mode.
 */
export function DirectionalIcon({
  icon: Icon,
  mirror = true,
  className,
  ...props
}: DirectionalIconProps) {
  return (
    <Icon
      className={cn(
        mirror && "rtl:rotate-180 transition-transform",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

