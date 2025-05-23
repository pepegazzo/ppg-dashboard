
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateProjectRevenue } from "@/utils/projectRevenue";

interface DeleteInvoiceDialogProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  selectedInvoices: string[];
  setSelectedInvoices: (invoiceIds: string[]) => void;
  onSuccess: () => void;
}

export function DeleteInvoiceDialog({
  showDeleteModal,
  setShowDeleteModal,
  selectedInvoices,
  setSelectedInvoices,
  onSuccess
}: DeleteInvoiceDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [affectedProjects, setAffectedProjects] = useState<string[]>([]);
  
  // Get affected project IDs when selected invoices change
  useEffect(() => {
    if (selectedInvoices.length === 0) {
      setAffectedProjects([]);
      return;
    }
    
    const fetchAffectedProjects = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('project_id')
        .in('id', selectedInvoices);
        
      if (!error && data) {
        // Extract unique project IDs
        const projectIds = [...new Set(data.map(invoice => invoice.project_id))];
        setAffectedProjects(projectIds);
      }
    };
    
    fetchAffectedProjects();
  }, [selectedInvoices]);

  const deleteSelectedInvoices = async () => {
    if (selectedInvoices.length === 0) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('invoices')
        .delete()
        .in('id', selectedInvoices);
      
      if (error) {
        console.error('Error deleting invoices:', error);
        toast({
          title: "Error deleting invoices",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      // Update revenue for all affected projects
      for (const projectId of affectedProjects) {
        await updateProjectRevenue(projectId);
      }
      
      toast({
        title: "Invoices deleted",
        description: `Successfully deleted ${selectedInvoices.length} invoice(s)`,
      });
      
      onSuccess();
      setSelectedInvoices([]);
    } catch (err) {
      console.error('Unexpected error deleting invoices:', err);
      toast({
        title: "Error deleting invoices",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {selectedInvoices.length > 1 ? 'Invoices' : 'Invoice'}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedInvoices.length === 1 ? 'this invoice' : `these ${selectedInvoices.length} invoices`}? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteSelectedInvoices}
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
