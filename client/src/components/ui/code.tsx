import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "rounded-lg bg-background p-4 font-mono text-sm shadow-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
Code.displayName = "Code";

export { Code };
