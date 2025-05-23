
import { useState, useEffect } from "react";
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
  const { data: assignedProjects, isLoading: isLoadingAssigned, refetch: refetchAssigned } = useQuery({
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

  // Available projects not assigned to this client
  const { data: availableProjects, isLoading: isLoadingAvailable, refetch: refetchAvailable } = useQuery({
    queryKey: ['client-available-projects', clientId, assignedProjects],
    queryFn: async () => {
      // Get all projects first
      const { data: allProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (projectsError) throw projectsError;
      
      // Filter out projects that are already assigned to this client
      const currentAssignments = assignedProjects || [];
      return (allProjects || []).filter(project => 
        !currentAssignments.includes(project.id)
      );
    },
    enabled: !!assignedProjects // Only run when we have the assigned projects
  });

  useEffect(() => {
    if (isPopoverOpen) {
      refetchAssigned();
      refetchAvailable();
    }
  }, [isPopoverOpen, refetchAssigned, refetchAvailable]);

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

      // Create assignment record
      const { error: assignError } = await supabase
        .from('client_project_assignments')
        .insert({
          client_id: clientId,
          project_id: projectId
        });

      if (assignError) throw assignError;

      // Also update the project to set this client as the primary client
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          client_id: clientId,
          client_name: clientName
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      setIsPopoverOpen(false);

      toast({
        title: "Project assigned",
        description: `${projectName} has been assigned to this client`,
      });

      // Invalidate all client and project-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['client-available-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      ]);

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
          variant="default"
          size="sm"
          className="h-7 px-3 text-xs bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900 focus:ring-zinc-400"
          disabled={isUpdating}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Project
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 rounded shadow-lg min-w-[180px]" align="start">
        <div className="flex flex-col gap-1">
          {isLoadingAssigned || isLoadingAvailable ? (
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
                className="justify-start rounded hover:bg-muted text-sm"
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
