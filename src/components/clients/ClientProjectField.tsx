
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
      // Get all projects that don't already have this client assigned
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, client_id')
        .is('client_id', null)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const assignClientToProject = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);
      
      // Update the project with the client info
      const { error } = await supabase
        .from('projects')
        .update({ 
          client_id: clientId,
          client_name: clientName
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Client assigned to project",
        description: `${clientName} has been assigned to ${projectName}`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['available-projects', clientId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error("Error assigning client to project:", error);
      toast({
        title: "Error",
        description: "Failed to assign client to project",
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
          className="ml-1 h-7 text-amber-600 hover:text-amber-700"
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
            onClick={() => assignClientToProject(project.id, project.name)}
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
