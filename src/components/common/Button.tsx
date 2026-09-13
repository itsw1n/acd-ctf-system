"use client";

import type { ComponentProps } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "clip-button relative inline-flex min-h-11 items-center justify-center gap-2 border px-5 font-mono text-sm font-bold uppercase tracking-[0.12em] outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-danger/70 disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "border-danger bg-primary text-foreground shadow-[0_0_18px_rgba(227,38,54,0.13),inset_0_0_18px_rgba(227,38,54,0.08)] hover:border-danger-bright hover:bg-danger",
        secondary:
          "border-border-strong bg-surface text-foreground hover:border-danger hover:text-white",
        warning:
          "border-warning bg-warning/10 text-warning hover:bg-warning/15",
      },
      size: {
        sm: "min-h-9 px-4 text-xs",
        md: "min-h-11 px-5 text-sm",
        lg: "min-h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type AriaButtonProps = Omit<ComponentProps<typeof AriaButton>, "className">;

type ButtonProps = AriaButtonProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
