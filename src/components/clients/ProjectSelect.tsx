
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
  TooltipTrigger,
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

  // Fetch assigned projects 
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

  // Fetch available projects (not yet assigned to this client)
  const { data: availableProjects, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['client-available-projects', clientId],
    queryFn: async () => {
      const { data: assignedIds, error: assignedError } = await supabase
        .from('client_project_assignments')
        .select('project_id')
        .eq('client_id', clientId);
      
      if (assignedError) throw assignedError;
      
      const excludeIds = assignedIds?.map(item => item.project_id) || [];
      
      let query = supabase
        .from('projects')
        .select('id, name')
        .order('name');
        
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', excludeIds);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
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

  const removeProjectFromClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);
      
      const { error: deleteError } = await supabase
        .from('client_project_assignments')
        .delete()
        .eq('client_id', clientId)
        .eq('project_id', projectId);
      
      if (deleteError) throw deleteError;
      
      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id, client_name')
        .eq('id', projectId)
        .single();
        
      if (projectData?.client_id === clientId) {
        // Here we need to change the query to use company_name instead of name
        const { data: nextClient } = await supabase
          .from('client_project_assignments')
          .select(`
            clients (
              id,
              company_name
            )
          `)
          .eq('project_id', projectId)
          .neq('client_id', clientId)
          .limit(1)
          .single();
          
        if (nextClient) {
          await supabase
            .from('projects')
            .update({ 
              client_id: nextClient.clients.id,
              client_name: nextClient.clients.company_name
            })
            .eq('id', projectId);
        } else {
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
      
      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
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
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 p-1 font-normal hover:bg-transparent"
            disabled={isUpdating}
          >
            <span className="text-xs text-muted-foreground cursor-pointer flex items-center">
              <Plus className="h-3 w-3 mr-1" /> Add Project
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-col gap-1 min-w-[200px]">
            {isLoadingAvailable ? (
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available projects...
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
                No available projects to assign
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
