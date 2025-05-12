import * as React from "react";
import { Button, ButtonProps } from "./button";

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} variant="secondary" size="lg" {...props}>
      {children}
    </Button>
  )
);
SecondaryButton.displayName = "SecondaryButton"; 