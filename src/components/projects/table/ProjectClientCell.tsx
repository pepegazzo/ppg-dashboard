
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";

interface ProjectClientCellProps {
  clientName: string | null;
  projectId: string;
}

export function ProjectClientCell({ clientName, projectId }: ProjectClientCellProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localClientName, setLocalClientName] = useState(clientName);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available clients for assignment
  const { data: availableClients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['all-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .order('company_name');
      if (error) throw error;
      return data || [];
    }
  });

  // Helper for updating the client for a project (assign or clear client)
  const setPrimaryClient = async (clientId?: string, clientName?: string) => {
    try {
      setIsSubmitting(true);

      // Update local state immediately for a responsive UI
      setLocalClientName(clientName || null);

      // 1. Update the projects table
      const updateData: { client_id: string | null; client_name: string | null } = {
        client_id: clientId || null,
        client_name: clientName || null
      };

      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (projectUpdateError) throw projectUpdateError;

      // 2. Update the client_project_assignments table
      if (clientId) {
        // First remove any existing assignments for this project
        const { error: deleteError } = await supabase
          .from('client_project_assignments')
          .delete()
          .eq('project_id', projectId);
        
        if (deleteError) throw deleteError;
          
        // Then add the new assignment
        const { error: insertError } = await supabase
          .from('client_project_assignments')
          .insert({
            client_id: clientId,
            project_id: projectId
          });
          
        if (insertError) throw insertError;
      } else {
        // If clearing the client, just delete any assignments
        const { error: deleteError } = await supabase
          .from('client_project_assignments')
          .delete()
          .eq('project_id', projectId);
          
        if (deleteError) throw deleteError;
      }

      toast({
        title: "Project updated",
        description: clientName
          ? `${clientName} is now the client for this project`
          : "No client assigned to this project.",
      });

      // Invalidate both projects and client-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['all-clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
    } catch (error) {
      console.error("Error updating client:", error);
      // Revert local state on error
      setLocalClientName(clientName);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingClients) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm hover:bg-muted px-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : null}
            {localClientName || "No Client"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem
            onClick={() => setPrimaryClient(undefined, undefined)}
            disabled={isSubmitting || !localClientName}
          >
            No Client
            {!localClientName && (
              <Badge variant="secondary" className="ml-2">Current</Badge>
            )}
          </DropdownMenuItem>
          {availableClients &&
            availableClients.map((client: any) => (
              <DropdownMenuItem
                key={client.id}
                onClick={() => setPrimaryClient(client.id, client.company_name)}
                disabled={isSubmitting}
              >
                <span className="flex-1">{client.company_name}</span>
                {localClientName === client.company_name && (
                  <Badge variant="secondary" className="ml-2">Current</Badge>
                )}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  );
}
