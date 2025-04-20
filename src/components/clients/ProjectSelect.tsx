
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectSelectProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  activeProjects: Project[] | null;
}

export function ProjectSelect({ isOpen, onClose, clientId, activeProjects }: ProjectSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    activeProjects?.map(p => p.id) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allProjects } = useQuery({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status')
        .order('name');
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      return [...prev, projectId];
    });
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Remove all existing associations
      const { error: deleteError } = await supabase
        .from('client_active_projects')
        .delete()
        .eq('client_id', clientId);
      
      if (deleteError) throw deleteError;
      
      // Add new associations
      if (selectedProjects.length > 0) {
        const { error: insertError } = await supabase
          .from('client_active_projects')
          .insert(
            selectedProjects.map(projectId => ({
              client_id: clientId,
              project_id: projectId
            }))
          );
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Projects updated",
        description: "Active projects have been updated successfully",
      });
      
      // Force a hard refresh of all client data to ensure UI updates
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      // Also invalidate any other related queries
      await queryClient.invalidateQueries({ queryKey: ['available-projects'] });
      
      // Close modal after a short delay to ensure invalidation completes
      setTimeout(() => {
        onClose();
        
        // This additional refetch helps ensure the UI is updated
        queryClient.refetchQueries({ queryKey: ['clients'] });
      }, 300);
    } catch (error) {
      console.error("Error updating projects:", error);
      toast({
        title: "Error",
        description: "Failed to update active projects",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Active Projects</DialogTitle>
          <DialogDescription>
            Choose which projects this client is actively involved with.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {allProjects?.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-muted-foreground">{project.status}</span>
                </div>
                <Button
                  variant={selectedProjects.includes(project.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleProject(project.id)}
                >
                  {selectedProjects.includes(project.id) && (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {selectedProjects.includes(project.id) ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
