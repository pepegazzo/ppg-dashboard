
import { useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, LinkIcon } from "lucide-react";
import { ProjectPasswordDialog } from "./ProjectPasswordDialog";

interface ProjectActionsCellProps {
  projectId: string;
  projectPassword?: string | null;
  projectSlug?: string | null;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedProjects: (ids: string[]) => void;
  onEditProject: () => void;
}

export function ProjectActionsCell({
  projectId,
  projectPassword,
  projectSlug,
  setShowDeleteModal,
  setSelectedProjects,
  onEditProject,
}: ProjectActionsCellProps) {
  const [open, setOpen] = useState(false);

  const handlePortalClick = () => {
    setOpen(true);
  };

  return (
    <TableCell className="flex items-center gap-2 py-0">
      <Button
        variant="ghost" 
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-muted"
        onClick={onEditProject}
        aria-label="Edit project"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="default"
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handlePortalClick}
      >
        <LinkIcon className="mr-1 w-4 h-4" />
        Portal
      </Button>
      <ProjectPasswordDialog
        open={open}
        setOpen={setOpen}
        projectId={projectId}
        projectPassword={projectPassword}
        projectSlug={projectSlug}
      />
    </TableCell>
  );
}
