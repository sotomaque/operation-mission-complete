import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-20 w-full rounded-sm border border-dossier-ink/40 bg-dossier-paper/40 px-3 py-2 font-mono text-sm text-dossier-ink placeholder:text-dossier-ink-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
