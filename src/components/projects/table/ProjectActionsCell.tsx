
import { useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { ProjectPasswordDialog } from "./ProjectPasswordDialog";

// Helper to generate an 8-character alphanumeric password
function generateSimplePassword() {
  return Math.random().toString(36).slice(-8).toUpperCase();
}

interface ProjectActionsCellProps {
  projectId: string;
  projectPassword?: string | null;
  projectSlug?: string | null;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedProjects: (ids: string[]) => void;
}

export function ProjectActionsCell({
  projectId,
  projectPassword,
  projectSlug,
  setShowDeleteModal,
  setSelectedProjects,
}: ProjectActionsCellProps) {
  const [open, setOpen] = useState(false);

  const handlePortalClick = () => {
    setOpen(true);
  };

  return (
    <TableCell className="flex items-center gap-2 p-0">
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
        projectPassword={projectPassword}
        projectSlug={projectSlug}
      />
    </TableCell>
  );
}
