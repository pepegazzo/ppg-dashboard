
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
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);

  // Fetch assigned projects (to not double-assign)
  const { data: assignedProjects, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['client-assigned-projects', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_project_assignments')
        .select('project_id')
        .eq('client_id', clientId);
      if (error) throw error;
      const projectIds = (data ?? []).map(item => item.project_id);
      setAssignedProjectIds(projectIds);
      return projectIds;
    }
  });

  // Available projects not assigned to this client
  const { data: availableProjects, isLoading: isLoadingAvailable, refetch: refetchAvailable } = useQuery({
    queryKey: ['client-available-projects', clientId, assignedProjectIds],
    queryFn: async () => {
      // Make sure assignedProjects is defined before using it
      const excludeIds = assignedProjectIds || [];
      
      console.log("Fetching available projects, excluding:", excludeIds);
      
      let query = supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      // Only apply the filter if there are IDs to exclude
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', excludeIds);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching available projects:", error);
        throw error;
      }
      
      console.log("Available projects fetched:", data);
      return data ?? [];
    },
    enabled: false // Don't run automatically
  });

  // When popover opens, fetch available projects
  useEffect(() => {
    if (isPopoverOpen) {
      refetchAvailable();
    }
  }, [isPopoverOpen, refetchAvailable]);

  const assignProjectToClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);

      // Get client company name for project update
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      const clientName = clientData?.company_name || 'Unknown';

      // 1. Insert into client_project_assignments
      const { error: assignError } = await supabase
        .from('client_project_assignments')
        .insert({ 
          client_id: clientId,
          project_id: projectId 
        });

      if (assignError) throw assignError;

      // 2. Always update the projects table with this client as primary
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          client_id: clientId,
          client_name: clientName
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      // Update local state immediately
      setAssignedProjectIds(prev => [...prev, projectId]);
      setIsPopoverOpen(false);

      toast({
        title: "Project assigned",
        description: `${projectName} has been assigned to this client`,
      });

      // Invalidate all relevant queries
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
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={isUpdating}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Project
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
