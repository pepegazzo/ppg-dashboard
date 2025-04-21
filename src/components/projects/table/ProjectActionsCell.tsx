import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { ProjectPasswordDialog } from "./ProjectPasswordDialog";
import { supabase } from "@/integrations/supabase/client";

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
  const [slug, setSlug] = useState<string | null>(null);

  // Fetch the slug separately just for verification
  useEffect(() => {
    async function fetchProjectSlug() {
      try {
        console.log("Fetching slug for project ID:", projectId);
        const { data, error } = await supabase
          .from("projects")
          .select("slug, name")
          .eq("id", projectId)
          .single();
        
        if (error) {
          console.error("Error fetching project slug:", error);
          return;
        }
        
        console.log("Project data for verification:", data);
        setSlug(data.slug);
      } catch (err) {
        console.error("Unexpected error fetching slug:", err);
      }
    }
    
    fetchProjectSlug();
  }, [projectId]);

  const handlePortalClick = () => {
    console.log("Opening portal dialog for project:", projectId);
    console.log("Current slug from verification:", slug);
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
