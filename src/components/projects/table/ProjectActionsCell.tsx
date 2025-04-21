
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ProjectActionsCellProps {
  projectId: string;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedProjects: (ids: string[]) => void;
}

export function ProjectActionsCell({ projectId }: ProjectActionsCellProps) {
  return (
    <TableCell className="p-[10px] text-center">
      <Button variant="outline" size="sm" className="flex items-center justify-center gap-1 text-xs">
        Portal
        <ExternalLink className="ml-1 h-3 w-3" />
      </Button>
    </TableCell>
  );
}
