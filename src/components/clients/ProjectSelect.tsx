
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";

interface ProjectSelectProps {
  clientId: string;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, onUpdate }: ProjectSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch assigned projects (to not double-assign)
  const { data: assignedProjects } = useQuery({
    queryKey: ['client-assigned-projects', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_project_assignments')
        .select('project_id')
        .eq('client_id', clientId);
      if (error) throw error;
      return (data ?? []).map(item => item.project_id);
    }
  });

  // Available projects not assigned to this client (fix: always exclude assigned)
  const { data: availableProjects, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['client-available-projects', clientId, assignedProjects],
    queryFn: async () => {
      let excludeIds = assignedProjects ?? [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .not('id', 'in', excludeIds.length === 0 ? ["000"] : excludeIds)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: isPopoverOpen
  });

  const assignProjectToClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      const clientName = clientData?.company_name || 'Unknown';

      const { error: assignError } = await supabase
        .from('client_project_assignments')
        .insert({ 
          client_id: clientId,
          project_id: projectId 
        });

      if (assignError) throw assignError;

      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', projectId)
        .single();

      if (!projectData?.client_id) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ 
            client_id: clientId,
            client_name: clientName
          })
          .eq('id', projectId);

        if (updateError) throw updateError;
      }

      setIsPopoverOpen(false);

      toast({
        title: "Project assigned",
        description: `${projectName} has been assigned to this client`,
      });

      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error assigning project to client:", error);
      toast({
        title: "Error",
        description: "Failed to assign project to client",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost"
          size="sm"
          className="h-7 px-1 text-muted-foreground hover:bg-amber-50 rounded-full border border-amber-100 shadow-none"
          disabled={isUpdating}
          style={{ boxShadow: 'none', background: "#fff" }}
        >
          <span className="text-xs flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Project
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 rounded shadow-lg min-w-[180px]" align="start">
        <div className="flex flex-col gap-1">
          {isLoadingAvailable ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : availableProjects && availableProjects.length > 0 ? (
            availableProjects.map((project) => (
              <Button 
                key={project.id} 
                variant="ghost" 
                size="sm"
                className="justify-start rounded hover:bg-amber-50 text-sm"
                onClick={() => assignProjectToClient(project.id, project.name)}
                disabled={isUpdating}
              >
                {project.name}
              </Button>
            ))
          ) : (
            <div className="text-xs text-muted-foreground px-2 py-2">
              No available projects to assign
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
