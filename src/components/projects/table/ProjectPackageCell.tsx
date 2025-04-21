
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { getServiceIcon } from "../form/ProjectPackageField";

interface ProjectPackageCellProps {
  packageName: string | null | undefined;
  projectId: string;
}

export function ProjectPackageCell({ 
  packageName: initialPackageName
}: ProjectPackageCellProps) {
  // We're simplifying this component to just display the package name
  // No editing functionality in the cell itself
  return (
    <div className="flex items-center justify-start h-full">
      {initialPackageName ? (
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          {getServiceIcon(initialPackageName)}
          <span className="truncate leading-none">{initialPackageName}</span>
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">No service</span>
      )}
    </div>
  );
}
