import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
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
  onEditProject
}: ProjectActionsCellProps) {
  const [open, setOpen] = useState(false);
  const handlePortalClick = () => {
    setOpen(true);
  };
  
  return (
    <>
      <Button variant="default" size="sm" className="bg-yellow-400 text-zinc-800 hover:bg-yellow-500" onClick={handlePortalClick}>
        <LinkIcon className="mr-1 w-4 h-4" />
        Portal
      </Button>
      <ProjectPasswordDialog open={open} setOpen={setOpen} projectId={projectId} projectPassword={projectPassword} projectSlug={projectSlug} />
    </>
  );
}
