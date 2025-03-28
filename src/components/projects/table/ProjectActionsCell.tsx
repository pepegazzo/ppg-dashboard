
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProjectActionsCellProps {
  projectId: string;
  onDelete: () => void;
}

export function ProjectActionsCell({ projectId, onDelete }: ProjectActionsCellProps) {
  return (
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
          onClick={onDelete} 
          className="text-destructive focus:text-destructive"
        >
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
