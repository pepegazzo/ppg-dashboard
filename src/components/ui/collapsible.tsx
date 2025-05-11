
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  />
))

CollapsibleContent.displayName = "CollapsibleContent"

// Export the original components
export { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
}

// Add a new component for table row collapsible
interface TableRowCollapsibleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  content: ReactNode;
  className?: string;
}

export function TableRowCollapsible({ 
  open, 
  onOpenChange, 
  children, 
  content, 
  className 
}: TableRowCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className={cn("w-full", className)}>
      <CollapsibleTrigger asChild>{children}</CollapsibleTrigger>
      <CollapsibleContent className="w-full transition-all duration-300">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}
