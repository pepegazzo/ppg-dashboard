
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";
import {
  Select,
  SelectContent,
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
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allProjects, isLoading } = useQuery({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status')
        .order('name');
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const toggleProject = async (projectId: string) => {
    try {
      setIsSubmitting(true);
      
      if (activeProjects?.some(p => p.id === projectId)) {
        // Remove project
        const { error } = await supabase
          .from('client_active_projects')
          .delete()
          .match({ 
            client_id: clientId,
            project_id: projectId 
          });
        
        if (error) throw error;
      } else {
        // Add project
        const { error } = await supabase
          .from('client_active_projects')
          .insert({
            client_id: clientId,
            project_id: projectId
          });
        
        if (error) throw error;
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.refetchQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Projects updated",
        description: "Active projects have been updated",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error toggling project:", error);
      toast({
        title: "Error",
        description: "Failed to update active projects",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !allProjects) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading projects...
      </div>
    );
  }

  return (
    <Select
      onValueChange={toggleProject}
      value={activeProjects?.[0]?.id}
      disabled={isSubmitting}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {allProjects.map((project) => (
          <SelectItem 
            key={project.id} 
            value={project.id}
            className="flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span>{project.name}</span>
              {project.status && (
                <span className="text-xs text-muted-foreground">{project.status}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
