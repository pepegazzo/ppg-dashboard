
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

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
  // Handler for opening the portal, for now just logs.
  const handlePortalClick = () => {
    // Replace with actual portal logic as needed
    console.log(`Portal button clicked for project ID: ${projectId}`);
    window.open(`/projects/${projectId}/portal`, "_blank", "noopener,noreferrer");
  };

  const handleDelete = () => {
    setSelectedProjects([projectId]);
    setShowDeleteModal(true);
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
        <ExternalLink className="ml-1 w-4 h-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={handleDelete}
        aria-label="Delete project"
      >
        <span className="sr-only">Delete</span>
        {/* You may want to add an icon here for delete */}
        &#10005;
      </Button>
    </TableCell>
  );
}

