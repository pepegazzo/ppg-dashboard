
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

interface ProjectClientCellProps {
  clientName: string | null;
  projectId: string;
}

export function ProjectClientCell({ clientName, projectId }: ProjectClientCellProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      const updateData: { client_id: string | null; client_name: string | null } = {
        client_id: clientId || null,
        client_name: clientName || null
      };

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: clientName
          ? `${clientName} is now the client for this project`
          : "No client assigned to this project.",
      });

      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error("Error updating client:", error);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-sm hover:bg-muted px-2"
          disabled={isSubmitting}
        >
          {clientName || "No Client"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          onClick={() => setPrimaryClient(undefined, undefined)}
          disabled={isSubmitting || !clientName}
        >
          No Client
          {!clientName && (
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
              {clientName === client.company_name && (
                <Badge variant="secondary" className="ml-2">Current</Badge>
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
