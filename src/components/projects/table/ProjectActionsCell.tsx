
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface ProjectActionsCellProps {
  projectId: string;
  setSelectedProjects: (projectIds: string[]) => void;
  setShowDeleteModal: (show: boolean) => void;
  onEdit: (projectId: string) => void;
}

export function ProjectActionsCell({
  projectId,
  setSelectedProjects,
  setShowDeleteModal,
  onEdit
}: ProjectActionsCellProps) {
  const handleDeleteClick = () => {
    setSelectedProjects([projectId]);
    setShowDeleteModal(true);
  };

  const handleEditClick = () => {
    onEdit(projectId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEditClick}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={handleDeleteClick}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
