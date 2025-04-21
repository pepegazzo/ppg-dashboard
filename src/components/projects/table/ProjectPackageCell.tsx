
import { useState } from "react";
import { TableCell } from "@/components/ui/table";
import { ServicePopover } from "./ServicePopover";

/**
 * ProjectPackageCell with interactive popover for in-table package/service selection.
 */
interface ProjectPackageCellProps {
  packageName?: string | null;
  projectId: string;
}

/**
 * The cell now contains an interactive popover that allows updating the package/service.
 */
export function ProjectPackageCell({ packageName, projectId }: ProjectPackageCellProps) {
  // We want to update UI immediately on change
  const [currentPackage, setCurrentPackage] = useState(packageName || null);

  return (
    <TableCell className="relative group min-w-[120px] cursor-pointer">
      <ServicePopover
        projectId={projectId}
        currentPackageName={currentPackage || ""}
        onPackageChange={(pkg) => setCurrentPackage(pkg?.name ?? null)}
      />
    </TableCell>
  );
}
