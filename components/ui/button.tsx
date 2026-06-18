import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-mono text-sm font-medium tracking-wider uppercase transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary action (Accept, Confirm) — copper fill, paper-edge stroke.
        primary:
          "bg-copper text-dossier-paper border border-copper-bright hover:bg-copper-bright shadow-[0_2px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] active:translate-y-[1px] active:shadow-none",
        // Secondary (Decline, Back) — outlined on paper, no fill.
        outline:
          "border border-dossier-ink/40 bg-transparent text-dossier-ink hover:bg-dossier-ink/8",
        // Ghost on dark surfaces.
        ghost:
          "text-dossier-fg hover:bg-dossier-fg/10 border border-transparent",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
