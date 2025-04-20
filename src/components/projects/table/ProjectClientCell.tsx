import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Loader2, Users } from "lucide-react";
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

  const createClient = async (clientData: {
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
      
      // Create the client (company)
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_name: clientData.company_name,
          company: clientData.company,
          website: clientData.website,
          address: clientData.address,
          notes: clientData.notes,
          // Required fields for the clients table
          email: clientData.contact?.email || "",
          phone: clientData.contact?.phone || "",
          role: clientData.contact?.role || ""
        })
        .select()
        .single();
      
      if (clientError) throw clientError;
      
      // Create the primary contact
      if (clientData.contact && clientData.contact.name) {
        const { error: contactError } = await supabase
          .from('contacts')
          .insert({
            company_id: clientData.id,
            name: clientData.contact.name,
            role: clientData.contact.role,
            email: clientData.contact.email,
            phone: clientData.contact.phone,
            is_primary: true
          });
        
        if (contactError) {
          console.error("Error creating contact:", contactError);
        }
      }
      
      // Assign the client to the project
      const { error: assignError } = await supabase
        .from('client_project_assignments')
        .insert({
          client_id: clientData.id,
          project_id: projectId
        });
      
      if (assignError) throw assignError;
      
      // Set as primary client for the project
      await setPrimaryClient(clientData.id, clientData.company_name);
      
      setIsModalOpen(false);
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
          <Users className="h-3.5 w-3.5 mr-2" />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Client
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createClient}
        isSubmitting={isSubmitting}
      />
    </DropdownMenu>
  );
}
