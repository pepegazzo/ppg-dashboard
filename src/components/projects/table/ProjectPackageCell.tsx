
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectPackageCellProps {
  packageName: string | null | undefined;
}

export function ProjectPackageCell({ packageName }: ProjectPackageCellProps) {
  return packageName ? (
    <Badge variant="outline" className="inline-flex items-center text-xs w-fit">
      <span className="truncate">{packageName}</span>
    </Badge>
  ) : (
    <span className="text-muted-foreground text-xs">No package</span>
  );
}
