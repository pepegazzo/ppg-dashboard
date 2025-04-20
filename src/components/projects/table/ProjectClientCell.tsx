
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ClientModal from "@/components/clients/ClientModal";

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

  const handleCreateClient = async (clientData: {
    name: string;
    company: string;
    role: string;
    email: string;
    phone: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      // Insert the new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      if (clientError) throw clientError;
      
      // Update the project with the new client
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          client_id: newClient.id,
          client_name: newClient.name
        })
        .eq('id', projectId);
      
      if (projectError) throw projectError;
      
      // Success!
      toast({
        title: "Client created",
        description: `${clientData.name} has been added as a client`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
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

  if (clientName === "No Client") {
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
    <span 
      className="text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
      onClick={() => navigate("/clients")}
    >
      {clientName}
    </span>
  );
}
