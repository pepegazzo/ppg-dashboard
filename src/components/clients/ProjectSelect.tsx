
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";

interface ProjectSelectProps {
  clientId: string;
  activeProject: Project | null;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, activeProject, onUpdate }: ProjectSelectProps) {
  const { toast } = useToast();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [localProject, setLocalProject] = useState<Project | null>(activeProject);

  const { data: allProjects, isLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const setProjectClient = async (projectId: string, projectName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ client_id: clientId })
        .eq('id', projectId);
      
      if (error) throw error;
      
      setLocalProject({ id: projectId, name: projectName });
      setIsPopoverOpen(false);
      
      toast({
        title: "Success",
        description: "Project assignment updated",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error setting project client:", error);
      toast({
        title: "Error",
        description: "Failed to update project assignment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
          {localProject ? (
            <Badge className={getStatusColor(true)}>{localProject.name}</Badge>
          ) : (
            <Badge className={getStatusColor(false)}>No project</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-1">
          {allProjects?.map((project) => (
            <Button 
              key={project.id} 
              variant="ghost" 
              size="sm" 
              className={`justify-start ${localProject?.id === project.id ? 'bg-emerald-50' : ''}`} 
              onClick={() => setProjectClient(project.id, project.name)}
            >
              <Badge className={getStatusColor(localProject?.id === project.id)}>{project.name}</Badge>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
