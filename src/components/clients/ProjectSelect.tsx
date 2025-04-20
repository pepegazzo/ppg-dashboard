
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectSelectProps {
  clientId: string;
  activeProject: Project | null;
  onUpdate?: () => void;
}

export function ProjectSelect({ clientId, activeProject, onUpdate }: ProjectSelectProps) {
  const { toast } = useToast();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localProject, setLocalProject] = useState<Project | null>(activeProject);

  const { data: availableProjects, isLoading } = useQuery({
    queryKey: ['available-projects', clientId],
    queryFn: async () => {
      // Get all projects that aren't already assigned to this client
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .not('client_id', 'eq', clientId)
        .order('name');
      
      if (error) throw error;
      return data as Project[];
    }
  });

  const assignProjectToClient = async (projectId: string, projectName: string) => {
    try {
      setIsUpdating(true);
      
      // Update the project to use this client as its client
      const { error } = await supabase
        .from('projects')
        .update({ 
          client_id: clientId
        })
        .eq('id', projectId);
      
      if (error) throw error;
      
      setLocalProject({ id: projectId, name: projectName });
      setIsPopoverOpen(false);
      
      toast({
        title: "Project assigned",
        description: `Project has been assigned to this client`,
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error assigning project to client:", error);
      toast({
        title: "Error",
        description: "Failed to assign project to client",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
                {isUpdating ? (
                  <Badge className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating...
                  </Badge>
                ) : localProject ? (
                  <Badge className={getStatusColor(true)}>{localProject.name}</Badge>
                ) : (
                  <Badge className={getStatusColor(false)}>No project</Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to change project</p>
          </TooltipContent>
        </Tooltip>
        
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-1">
            {availableProjects && availableProjects.length > 0 ? (
              availableProjects.map((project) => (
                <Button 
                  key={project.id} 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start" 
                  onClick={() => assignProjectToClient(project.id, project.name)}
                  disabled={isUpdating}
                >
                  <Badge className={getStatusColor(false)}>{project.name}</Badge>
                </Button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-2">
                No available projects
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
