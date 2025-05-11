
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

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
      <CollapsibleContent className="w-full">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}
