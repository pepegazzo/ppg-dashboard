
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
    <TableCell className="text-center">
      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1">
        Portal
        <ExternalLink className="ml-1 h-4 w-4" />
      </Button>
    </TableCell>
  );
}
