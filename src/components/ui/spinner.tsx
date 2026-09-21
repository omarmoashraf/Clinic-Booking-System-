import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

export function Spinner({
  className,
  size = "md",
  label = "Loading...",
  ...props
}: SpinnerProps) {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-label={label}>
      <Loader2
        className={cn("animate-spin text-primary", sizeMap[size], className)}
        aria-hidden="true"
        {...props}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

