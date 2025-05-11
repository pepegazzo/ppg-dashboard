import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ClientProjectFieldProps {
  clientId: string;
  clientName: string;
  activeProjects: any[] | null;
}

export default function ClientProjectField({ 
  clientId, 
  clientName,
  activeProjects 
}: ClientProjectFieldProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: availableProjects } = useQuery({
    queryKey: ['available-projects', clientId],
    queryFn: async () => {
      // Get the current project for this client if any
      const { data: clientProject } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', clientId)
        .single();
      
      const excludedIds = clientProject ? [clientProject.id] : [];
      
      // Get all projects that aren't already assigned to this client
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .not('id', 'in', excludedIds)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const assignProjectToClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);
      
      // Update the project to use this client as its client
      const { error } = await supabase
        .from('projects')
        .update({ 
          client_id: clientId,
          client_name: clientName
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Project assigned",
        description: `${projectName} has been added to ${clientName}'s active projects`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['available-projects', clientId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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

  // If there are no available projects, show nothing or a disabled state
  if (!availableProjects || availableProjects.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-1 h-7 text-zinc-800 hover:text-zinc-900"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
          )}
          Add to Project
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Assign to Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableProjects.map((project) => (
          <DropdownMenuItem 
            key={project.id}
            onClick={() => assignProjectToClient(project.id, project.name)}
            className="cursor-pointer"
          >
            <Check className="h-4 w-4 mr-2 opacity-0" />
            <span>{project.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
