
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ProjectSelectProps {
  clientId: string;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, onUpdate }: ProjectSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch projects assigned to this client
  const { data: assignedProjects, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['client-assigned-projects', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_project_assignments')
        .select(`
          project_id,
          projects (
            id, 
            name,
            status
          )
        `)
        .eq('client_id', clientId);
      
      if (error) throw error;
      return data?.map(item => item.projects) || [];
    }
  });

  // Fetch available projects that could be assigned to this client
  const { data: availableProjects, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['client-available-projects', clientId],
    queryFn: async () => {
      // Get all assigned project IDs
      const { data: assignedIds } = await supabase
        .from('client_project_assignments')
        .select('project_id')
        .eq('client_id', clientId);
      
      const excludeIds = assignedIds?.map(item => item.project_id) || [];
      
      // Get all projects that aren't already assigned to this client
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .not('id', 'in', excludeIds.length > 0 ? excludeIds : ['00000000-0000-0000-0000-000000000000'])
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!assignedProjects
  });

  const assignProjectToClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);
      
      // Get client name from data attribute for better reliability
      const clientName = document.querySelector(`[data-client-id="${clientId}"]`)?.getAttribute('data-client-name') || 'Unknown';
      
      // Add the assignment to the join table
      const { error: assignError } = await supabase
        .from('client_project_assignments')
        .insert({ 
          client_id: clientId,
          project_id: projectId 
        });
      
      if (assignError) throw assignError;
      
      // If this is the first project for this client, also update the project's primary client
      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', projectId)
        .single();
        
      if (!projectData?.client_id) {
        // Update the project to use this client as its primary client
        const { error: updateError } = await supabase
          .from('projects')
          .update({ 
            client_id: clientId,
            client_name: clientName
          })
          .eq('id', projectId);
        
        if (updateError) throw updateError;
      }
      
      // Close popover and show toast
      setIsPopoverOpen(false);
      
      toast({
        title: "Project assigned",
        description: `${projectName} has been assigned to this client`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Trigger parent update if provided
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
  
  const removeProjectFromClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);
      
      // Remove the assignment
      const { error: deleteError } = await supabase
        .from('client_project_assignments')
        .delete()
        .eq('client_id', clientId)
        .eq('project_id', projectId);
      
      if (deleteError) throw deleteError;
      
      // Check if this client is the primary client for the project
      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id, client_name')
        .eq('id', projectId)
        .single();
        
      if (projectData?.client_id === clientId) {
        // Find another client assigned to this project to make primary
        const { data: nextClient } = await supabase
          .from('client_project_assignments')
          .select(`
            clients (
              id,
              name
            )
          `)
          .eq('project_id', projectId)
          .limit(1)
          .single();
          
        if (nextClient) {
          // Update the project with the new primary client
          await supabase
            .from('projects')
            .update({ 
              client_id: nextClient.clients.id,
              client_name: nextClient.clients.name
            })
            .eq('id', projectId);
        } else {
          // No more clients assigned, set to "No Client"
          await supabase
            .from('projects')
            .update({ 
              client_id: null,
              client_name: "No Client"
            })
            .eq('id', projectId);
        }
      }
      
      toast({
        title: "Project removed",
        description: `${projectName} is no longer assigned to this client`,
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Trigger parent update if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error removing project from client:", error);
      toast({
        title: "Error",
        description: "Failed to remove project from client",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingAssigned) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {assignedProjects && assignedProjects.length > 0 ? (
          assignedProjects.map((project: any) => (
            <Badge 
              key={project.id} 
              variant="secondary"
              className="flex items-center gap-1 py-1 pr-1"
            >
              {project.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full ml-1 hover:bg-red-100"
                onClick={() => removeProjectFromClient(project.id, project.name)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="bg-slate-50">No projects</Badge>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-6 w-6"
                    disabled={isUpdating || (availableProjects && availableProjects.length === 0)}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex flex-col gap-1 min-w-[150px]">
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
                          className="justify-start" 
                          onClick={() => assignProjectToClient(project.id, project.name)}
                          disabled={isUpdating}
                        >
                          {project.name}
                        </Button>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground p-2">
                        No available projects
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assign project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
