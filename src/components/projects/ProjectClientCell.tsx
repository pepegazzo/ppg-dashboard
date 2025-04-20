
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
            name,
            company
          )
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data?.map(item => item.clients) || [];
    }
  });
  
  // Fetch all available clients that could be assigned to this project
  const { data: availableClients } = useQuery({
    queryKey: ['project-available-clients', projectId],
    queryFn: async () => {
      // Get all clients that are not already assigned to this project
      const { data: assignedClientIds } = await supabase
        .from('client_project_assignments')
        .select('client_id')
        .eq('project_id', projectId);
      
      const excludeIds = assignedClientIds?.map(item => item.client_id) || [];
      
      // Get clients not already assigned to this project
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          company
        `)
        .not('id', 'in', excludeIds.length > 0 ? excludeIds : ['00000000-0000-0000-0000-000000000000']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!assignedClients
  });

  const assignClientToProject = async (clientId: string, clientName: string) => {
    try {
      setIsSubmitting(true);
      
      // Create assignment in the join table
      const { error: assignError } = await supabase
        .from('client_project_assignments')
        .insert({ 
          client_id: clientId,
          project_id: projectId
        });
      
      if (assignError) throw assignError;
      
      // If this is the first client, also update the project's main client
      if (!assignedClients || assignedClients.length === 0) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ 
            client_id: clientId,
            client_name: clientName
          })
          .eq('id', projectId);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Client assigned",
        description: `${clientName} is now assigned to this project`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['project-assigned-clients'] });
      queryClient.invalidateQueries({ queryKey: ['project-available-clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      console.error("Error assigning client to project:", error);
      toast({
        title: "Error",
        description: "Failed to assign client to project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const removeClientFromProject = async (clientId: string, clientName: string) => {
    try {
      setIsSubmitting(true);
      
      // Remove the assignment
      const { error } = await supabase
        .from('client_project_assignments')
        .delete()
        .eq('project_id', projectId)
        .eq('client_id', clientId);
      
      if (error) throw error;
      
      // If this was the main client on the project, update the project
      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', projectId)
        .single();
        
      if (projectData?.client_id === clientId) {
        // Find another client if available
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
          // Set the next client as the main client
          await supabase
            .from('projects')
            .update({ 
              client_id: nextClient.clients.id,
              client_name: nextClient.clients.name
            })
            .eq('id', projectId);
        } else {
          // No more clients, reset to "No Client"
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
        title: "Client removed",
        description: `${clientName} is no longer assigned to this project`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['project-assigned-clients'] });
      queryClient.invalidateQueries({ queryKey: ['project-available-clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      console.error("Error removing client from project:", error);
      toast({
        title: "Error",
        description: "Failed to remove client from project",
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
      
      // Assign to the project
      await assignClientToProject(newClient.id, newClient.name);
      
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

  const showClientsList = () => {
    if (isLoadingAssigned) {
      return (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground"
          disabled
        >
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          Loading clients...
        </Button>
      );
    }
    
    if (!assignedClients || assignedClients.length === 0) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Client
        </Button>
      );
    }
    
    // Display number of assigned clients
    return (
      <Button 
        variant="ghost" 
        size="sm"
        className="text-zinc-800 hover:text-zinc-900 flex items-center gap-1"
      >
        <Users className="h-3.5 w-3.5 mr-1" />
        {assignedClients.length > 1 
          ? `${assignedClients.length} Clients` 
          : assignedClients[0].name}
      </Button>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {showClientsList()}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        {assignedClients && assignedClients.length > 0 && (
          <>
            <DropdownMenuLabel>Assigned Clients</DropdownMenuLabel>
            {assignedClients.map((client: any) => (
              <DropdownMenuItem 
                key={client.id}
                className="justify-between"
              >
                <span className="truncate">{client.name} - {client.company}</span>
                <Badge 
                  variant="outline" 
                  className="ml-2 cursor-pointer hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeClientFromProject(client.id, client.name);
                  }}
                >
                  Remove
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuLabel>Available Clients</DropdownMenuLabel>
        {availableClients && availableClients.length > 0 ? (
          availableClients.map((client: any) => (
            <DropdownMenuItem 
              key={client.id}
              onClick={() => assignClientToProject(client.id, client.name)}
            >
              {client.name} - {client.company}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No available clients</DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Client
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClient}
        isSubmitting={isSubmitting}
      />
    </DropdownMenu>
  );
}
