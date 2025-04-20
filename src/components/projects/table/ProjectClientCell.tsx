
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProjectClientCellProps {
  client_name: string;
  project_id: string;
  refreshProjects: () => void;
}

export function ProjectClientCell({ client_name, project_id, refreshProjects }: ProjectClientCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newCompany) return;
    
    try {
      setIsSubmitting(true);
      
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: newClientName,
          company: newCompany,
          role: "Client",
          email: "",
          phone: "",
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Update project with new client
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          client_id: newClient.id,
          client_name: newClient.name
        })
        .eq('id', project_id);

      if (projectError) throw projectError;

      toast({
        title: "Success",
        description: "Client created and linked to project",
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      refreshProjects();
      setIsOpen(false);
      
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

  if (client_name === "No Client") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="h-8">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client Name</label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <input
                type="text"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Create Client
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return <span>{client_name}</span>;
}
