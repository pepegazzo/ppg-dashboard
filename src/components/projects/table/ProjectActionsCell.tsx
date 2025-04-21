
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { ProjectPasswordDialog } from "./ProjectPasswordDialog";

interface ProjectActionsCellProps {
  projectId: string;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedProjects: (ids: string[]) => void;
}

export function ProjectActionsCell({
  projectId,
  setShowDeleteModal,
  setSelectedProjects,
}: ProjectActionsCellProps) {
  const [open, setOpen] = useState(false);

  const handlePortalClick = () => {
    console.log("Opening portal dialog for project:", projectId);
    setOpen(true);
  };

  return (
    <div className="flex items-center gap-2 p-0">
      <Button
        variant="default"
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handlePortalClick}
      >
        Portal
        <LinkIcon className="ml-1 w-4 h-4" />
      </Button>
      <ProjectPasswordDialog
        open={open}
        setOpen={setOpen}
        projectId={projectId}
      />
    </div>
  );
}
