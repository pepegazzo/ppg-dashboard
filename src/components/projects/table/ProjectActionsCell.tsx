
import { TableCell, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/table";

interface ProjectActionsCellProps {
  projectId: string;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedProjects: (ids: string[]) => void;
}

export function ProjectActionsCell({ projectId, setShowDeleteModal, setSelectedProjects }: ProjectActionsCellProps) {
  return (
    <TableCell className="text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log('View details', projectId)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log('Edit', projectId)}>
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedProjects([projectId]);
              setShowDeleteModal(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  );
}
