
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/dropdown-menu";

interface ProjectClientCellProps {
  clientName: string;
  projectId: string;
}

export function ProjectClientCell({ clientName, projectId }: ProjectClientCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch all clients that have this project as active
  const { data: availableClients } = useQuery({
    queryKey: ['project-available-clients', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_active_projects')
        .select(`
          client_id,
          clients (
            id,
            name,
            company
          )
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data?.map(row => row.clients) || [];
    }
  });

  const setProjectClient = async (clientId: string, clientName: string) => {
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
        title: "Client updated",
        description: `${clientName} is now the main client for this project`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error("Error updating project client:", error);
      toast({
        title: "Error",
        description: "Failed to update project client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClient = async (clientData: {
    name: string;
    company: string;
    role: string;
    email: string;
    phone: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      // Create the new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (clientError) throw clientError;
      
      // Add the project as active for this client
      const { error: activeProjectError } = await supabase
        .from('client_active_projects')
        .insert({ 
          client_id: newClient.id,
          project_id: projectId
        });
      
      if (activeProjectError) throw activeProjectError;
      
      // Set as the project's main client
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          client_id: newClient.id,
          client_name: newClient.name
        })
        .eq('id', projectId);
      
      if (projectError) throw projectError;
      
      toast({
        title: "Client created",
        description: `${clientData.name} has been added as the main client`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-available-clients'] });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error creating client",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (clientName === "No Client" && (!availableClients || availableClients.length === 0)) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Client
        </Button>
        
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateClient}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-amber-600 hover:text-amber-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            clientName
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableClients?.map((client: any) => (
          <DropdownMenuItem 
            key={client.id}
            onClick={() => setProjectClient(client.id, client.name)}
          >
            {client.name} - {client.company}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
