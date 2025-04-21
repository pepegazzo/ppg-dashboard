
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
    <TableCell className="p-[10px] text-left">
      <Button variant="outline" size="sm" className="flex items-center justify-start gap-1 text-xs px-1 py-1.5">
        Portal
        <ExternalLink className="ml-1 h-3 w-3" />
      </Button>
    </TableCell>
  );
}
