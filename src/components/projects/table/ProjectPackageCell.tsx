
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectPackageCellProps {
  packageName: string | null | undefined;
}

export function ProjectPackageCell({ packageName }: ProjectPackageCellProps) {
  return packageName ? (
    <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
      <Package className="h-3 w-3 shrink-0" />
      <span className="truncate">{packageName}</span>
    </Badge>
  ) : (
    <span className="text-muted-foreground text-xs">No package</span>
  );
}
