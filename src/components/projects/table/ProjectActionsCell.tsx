
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
    <TableCell className="text-center p-2">
      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1 text-xs px-1 py-1.5">
        Portal
        <ExternalLink className="ml-1 h-3 w-3" />
      </Button>
    </TableCell>
  );
}
