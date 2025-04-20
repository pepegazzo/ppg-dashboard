
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectSelectProps {
  clientId: string;
  activeProjects: Project[] | null;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, activeProjects, onUpdate }: ProjectSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    activeProjects?.map(p => p.id) || []
  );
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync local state when activeProjects prop changes
  useEffect(() => {
    setSelectedProjectIds(activeProjects?.map(p => p.id) || []);
  }, [activeProjects]);

  const { data: allProjects, isLoading } = useQuery({
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

  const toggleProject = async (projectId: string) => {
    try {
      setIsSubmitting(true);
      
      // Update local state first for responsive UI
      let newSelectedIds;
      if (selectedProjectIds.includes(projectId)) {
        // Remove project
        newSelectedIds = selectedProjectIds.filter(id => id !== projectId);
        setSelectedProjectIds(newSelectedIds);
        
        // Delete association from database
        const { error } = await supabase
          .from('client_active_projects')
          .delete()
          .match({ 
            client_id: clientId,
            project_id: projectId 
          });
        
        if (error) throw error;
      } else {
        // Add project
        newSelectedIds = [...selectedProjectIds, projectId];
        setSelectedProjectIds(newSelectedIds);
        
        // Add association to database
        const { error } = await supabase
          .from('client_active_projects')
          .insert({
            client_id: clientId,
            project_id: projectId
          });
        
        if (error) throw error;
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.refetchQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Projects updated",
        description: "Active projects have been updated",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error toggling project:", error);
      toast({
        title: "Error",
        description: "Failed to update active projects",
        variant: "destructive",
      });
      // Revert local state on error
      setSelectedProjectIds(activeProjects?.map(p => p.id) || []);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          ref={dropdownRef}
          variant="outline" 
          className="w-full justify-between" 
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              {selectedProjectIds.length > 0 
                ? `${selectedProjectIds.length} Project${selectedProjectIds.length > 1 ? 's' : ''} Selected` 
                : "Select Projects"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[220px] bg-background" align="start">
        <DropdownMenuLabel>Available Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-2 flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : allProjects && allProjects.length > 0 ? (
          <DropdownMenuGroup className="max-h-[300px] overflow-auto">
            {allProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                className="cursor-pointer flex justify-between items-center"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex flex-col">
                  <span>{project.name}</span>
                  {project.status && (
                    <span className="text-xs text-muted-foreground">{project.status}</span>
                  )}
                </div>
                {selectedProjectIds.includes(project.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuItem disabled>No projects available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
