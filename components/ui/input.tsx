import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-sm border border-dossier-ink/40 bg-dossier-paper/40 px-3 py-2 font-mono text-sm text-dossier-ink placeholder:text-dossier-ink-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
