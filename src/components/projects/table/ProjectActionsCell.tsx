
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
    <TableCell>
      <Button variant="ghost" size="sm" className="text-sm hover:bg-muted px-0 flex items-center gap-1">
        Portal 
        <ExternalLink className="h-3 w-3" />
      </Button>
    </TableCell>
  );
}
