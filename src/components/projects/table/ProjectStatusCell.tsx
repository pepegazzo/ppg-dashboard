
import { useState } from "react";
import { Project } from "../types";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Database } from "@/integrations/supabase/types";

interface ProjectStatusCellProps {
  project: Project;
  updatingProjectId: string | null;
  setUpdatingProjectId: (id: string | null) => void;
}

export function ProjectStatusCell({ 
  project, 
  updatingProjectId, 
  setUpdatingProjectId 
}: ProjectStatusCellProps) {
  const { toast } = useToast();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-emerald-100 text-emerald-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: Database["public"]["Enums"]["project_status"]) => {
    try {
      setUpdatingProjectId(projectId);
      const { data, error } = await supabase
        .from('projects')
        .update({
          status: newStatus
        })
        .eq('id', projectId)
        .select();

      if (error) {
        console.error('Error updating project status:', error);
        toast({
          title: "Error updating status",
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      if (data && data[0]) {
        setIsPopoverOpen(false);
      }
      
      toast({
        title: "Status updated",
        description: `Project status changed to ${newStatus}`
      });
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      toast({
        title: "Error updating status",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setUpdatingProjectId(null);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
          <Badge className={getStatusColor(project.status)}>
            {updatingProjectId === project.id ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Updating...
              </span>
            ) : project.status}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`justify-start ${project.status === 'Onboarding' ? 'bg-blue-50' : ''}`} 
            onClick={() => updateProjectStatus(project.id, 'Onboarding')} 
            disabled={updatingProjectId === project.id}
          >
            <Badge className={getStatusColor('Onboarding')}>Onboarding</Badge>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`justify-start ${project.status === 'Active' ? 'bg-blue-50' : ''}`} 
            onClick={() => updateProjectStatus(project.id, 'Active')} 
            disabled={updatingProjectId === project.id}
          >
            <Badge className={getStatusColor('Active')}>Active</Badge>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`justify-start ${project.status === 'Completed' ? 'bg-blue-50' : ''}`} 
            onClick={() => updateProjectStatus(project.id, 'Completed')} 
            disabled={updatingProjectId === project.id}
          >
            <Badge className={getStatusColor('Completed')}>Completed</Badge>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
