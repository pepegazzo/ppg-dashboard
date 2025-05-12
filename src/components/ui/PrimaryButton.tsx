import * as React from "react";
import { Button, ButtonProps } from "./button";

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <Button ref={ref} variant="default" size="lg" {...props}>
      {children}
    </Button>
  )
);
PrimaryButton.displayName = "PrimaryButton"; 