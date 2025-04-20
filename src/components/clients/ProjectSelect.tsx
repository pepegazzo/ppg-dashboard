
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectSelectProps {
  clientId: string;
  activeProjects: Project[] | null;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, activeProjects, onUpdate }: ProjectSelectProps) {
  const { toast } = useToast();

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

  const toggleProject = async (projectId: string) => {
    try {
      // Remove any existing project first
      if (activeProjects?.length) {
        await supabase
          .from('client_active_projects')
          .delete()
          .match({ client_id: clientId });
      }
      
      // Add new project
      const { error } = await supabase
        .from('client_active_projects')
        .insert({
          client_id: clientId,
          project_id: projectId
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Active project updated",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error toggling project:", error);
      toast({
        title: "Error",
        description: "Failed to update active project",
        variant: "destructive",
      });
    }
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
    <Select
      value={activeProjects?.[0]?.id || ""}
      onValueChange={toggleProject}
    >
      <SelectTrigger className="w-[200px] h-8">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {allProjects?.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id}
            >
              {project.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
