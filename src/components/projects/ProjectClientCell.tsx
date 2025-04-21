import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ClientModal from "@/components/clients/ClientModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ProjectClientCellProps {
  clientName: string;
  projectId: string;
}

export function ProjectClientCell({ clientName, projectId }: ProjectClientCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all assigned clients for this project
  const { data: assignedClients, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['project-assigned-clients', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_project_assignments')
        .select(`
          client_id,
          clients (
            id,
            company_name,
            company
          )
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data?.map(item => item.clients) || [];
    }
  });

  const setPrimaryClient = async (clientId: string, clientName: string) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          client_id: clientId,
          client_name: clientName
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Primary client updated",
        description: `${clientName} is now the primary client for this project`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error("Error updating primary client:", error);
      toast({
        title: "Error",
        description: "Failed to update primary client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientFormSubmit = async (clientData: {
    company_name: string;
    company: string;
    website?: string;
    address?: string;
    notes?: string;
    contact: {
      name: string;
      role?: string;
      email?: string;
      phone?: string;
    }
  }) => {
    try {
      setIsSubmitting(true);
      
      // First, create the client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_name: clientData.company_name,
          company: clientData.company,
          website: clientData.website || null,
          address: clientData.address || null,
          notes: clientData.notes || null,
          // These fields are still required in the database schema
          role: clientData.contact.role || "Primary Contact",
          email: clientData.contact.email || "",
          phone: clientData.contact.phone || "",
        })
        .select()
        .single();
      
      if (clientError) throw clientError;
      
      // Then create the primary contact
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          company_id: newClient.id,
          name: clientData.contact.name,
          role: clientData.contact.role || null,
          email: clientData.contact.email || null,
          phone: clientData.contact.phone || null,
          is_primary: true
        });
      
      if (contactError) throw contactError;
      
      // Assign the client to the project
      const { error: assignmentError } = await supabase
        .from('client_project_assignments')
        .insert({
          client_id: newClient.id,
          project_id: projectId
        });
      
      if (assignmentError) throw assignmentError;
      
      // Set as primary client for the project
      await setPrimaryClient(newClient.id, newClient.company_name);
      
      setIsModalOpen(false);
      toast({
        title: "Success",
        description: `${clientData.company_name} has been created and assigned to this project`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['project-assigned-clients'] });
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-sm hover:bg-muted"
        >
          {clientName || "No Client"}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select Primary Client</DropdownMenuLabel>
        {assignedClients && assignedClients.length > 0 ? (
          assignedClients.map((client: any) => (
            <DropdownMenuItem 
              key={client.id}
              onClick={() => setPrimaryClient(client.id, client.company_name)}
            >
              <span className="flex-1">{client.company_name}</span>
              {clientName === client.company_name && (
                <Badge variant="secondary" className="ml-2">Current</Badge>
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            No clients assigned to this project
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
