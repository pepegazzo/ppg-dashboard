
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

interface DeleteConfirmDialogProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  selectedProjects: string[];
  setSelectedProjects: (projectIds: string[]) => void;
  fetchProjects: () => void;
}

export function DeleteConfirmDialog({
  showDeleteModal,
  setShowDeleteModal,
  isDeleting,
  setIsDeleting,
  selectedProjects,
  setSelectedProjects,
  fetchProjects,
}: DeleteConfirmDialogProps) {
  const { toast } = useToast();

  const deleteSelectedProjects = async () => {
    if (selectedProjects.length === 0) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', selectedProjects);
      
      if (error) {
        console.error('Error deleting projects:', error);
        toast({
          title: "Error deleting projects",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Projects deleted",
        description: `Successfully deleted ${selectedProjects.length} project(s)`,
      });
      
      fetchProjects();
      setSelectedProjects([]);
    } catch (err) {
      console.error('Unexpected error deleting projects:', err);
      toast({
        title: "Error deleting projects",
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
          <AlertDialogTitle>Delete {selectedProjects.length > 1 ? 'Projects' : 'Project'}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedProjects.length === 1 ? 'this project' : `these ${selectedProjects.length} projects`}? 
            This action cannot be undone and all associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteSelectedProjects}
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
