
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
  activeProject: Project | null;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, activeProject, onUpdate }: ProjectSelectProps) {
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

  const setProjectClient = async (projectId: string) => {
    try {
      // Update the project to set this client as its client
      const { error } = await supabase
        .from('projects')
        .update({ client_id: clientId })
        .eq('id', projectId);
      
      if (error) throw error;
      
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
      value={activeProject?.id || ""}
      onValueChange={setProjectClient}
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
