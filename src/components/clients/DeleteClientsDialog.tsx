
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClients: string[];
  onSuccess: () => void;
}

export function DeleteClientsDialog({
  open,
  onOpenChange,
  selectedClients,
  onSuccess
}: DeleteClientsDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First, remove client_id references from any projects linked to these clients
      for (const clientId of selectedClients) {
        const { error: projectsUpdateError } = await supabase
          .from('projects')
          .update({ 
            client_id: null,
            client_name: 'No Client' 
          })
          .eq('client_id', clientId);
          
        if (projectsUpdateError) {
          console.error('Error removing client reference from projects:', projectsUpdateError);
          toast({
            variant: "destructive",
            title: "Error updating projects",
            description: projectsUpdateError.message || "Please try again later."
          });
          return;
        }
      }
      
      // Now that the foreign key constraints are addressed, delete the clients
      const { error } = await supabase
        .from('clients')
        .delete()
        .in('id', selectedClients);
        
      if (error) {
        toast({
          variant: "destructive",
          title: "Error deleting clients",
          description: error.message || "Please try again later."
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `${selectedClients.length} client(s) deleted successfully`
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error in deleteSelectedClients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting clients"
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {selectedClients.length > 1 ? 'Clients' : 'Client'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedClients.length === 1 ? 'this client' : `these ${selectedClients.length} clients`}? 
            This action cannot be undone and all client data will be permanently removed.
            <p className="mt-2 font-medium">
              Note: Any projects associated with {selectedClients.length === 1 ? 'this client' : 'these clients'} will be preserved, but they will no longer have a client assigned.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
