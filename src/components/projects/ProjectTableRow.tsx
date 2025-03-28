
import { useState } from "react";
import { Project } from "./types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Package, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Database } from "@/integrations/supabase/types";

interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  updatingProjectId: string | null;
  setUpdatingProjectId: (projectId: string | null) => void;
  setShowDeleteModal: (show: boolean) => void;
  fetchProjects?: () => void; // Optional prop to refresh all projects
}

export function TableRow({
  project,
  selectedProjects,
  toggleProjectSelection,
  setSelectedProjects,
  updatingProjectId,
  setUpdatingProjectId,
  setShowDeleteModal,
  fetchProjects,
}: ProjectTableRowProps) {
  const { toast } = useToast();
  // Add local state to track project data
  const [localProject, setLocalProject] = useState<Project>(project);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const updateProjectStatus = async (projectId: string, newStatus: Database["public"]["Enums"]["project_status"]) => {
    try {
      setUpdatingProjectId(projectId);
      
      const { data, error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)
        .select();
      
      if (error) {
        console.error('Error updating project status:', error);
        toast({
          title: "Error updating status",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local project state with the new status
      if (data && data[0]) {
        setLocalProject(prev => ({
          ...prev,
          status: newStatus
        }));
        
        // Close the popover after successful status update
        setIsPopoverOpen(false);
      }
      
      toast({
        title: "Status updated",
        description: `Project status changed to ${newStatus}`,
      });
      
      // If fetchProjects is provided, call it to refresh the entire list
      // We'll call this after a short delay to avoid UI flickering
      if (fetchProjects) {
        setTimeout(() => {
          fetchProjects();
        }, 300);
      }
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      toast({
        title: "Error updating status",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onboarding': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatRevenue = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString || '-';
    }
  };

  // Use localProject instead of project
  const currentProject = localProject;

  return (
    <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <Checkbox 
          checked={selectedProjects.includes(currentProject.id)}
          onCheckedChange={() => toggleProjectSelection(currentProject.id)}
          aria-label={`Select project ${currentProject.name}`}
        />
      </TableCell>
      <TableCell className="font-medium">{currentProject.name}</TableCell>
      <TableCell className="text-sm">{currentProject.client_name}</TableCell>
      
      <TableCell>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
              <Badge className={getStatusColor(currentProject.status)}>
                {updatingProjectId === currentProject.id ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating...
                  </span>
                ) : (
                  currentProject.status
                )}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                className={`justify-start ${currentProject.status === 'Onboarding' ? 'bg-blue-50' : ''}`}
                onClick={() => updateProjectStatus(currentProject.id, 'Onboarding')}
                disabled={updatingProjectId === currentProject.id}
              >
                <Badge className={getStatusColor('Onboarding')}>Onboarding</Badge>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={`justify-start ${currentProject.status === 'Active' ? 'bg-blue-50' : ''}`}
                onClick={() => updateProjectStatus(currentProject.id, 'Active')}
                disabled={updatingProjectId === currentProject.id}
              >
                <Badge className={getStatusColor('Active')}>Active</Badge>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={`justify-start ${currentProject.status === 'Completed' ? 'bg-blue-50' : ''}`}
                onClick={() => updateProjectStatus(currentProject.id, 'Completed')}
                disabled={updatingProjectId === currentProject.id}
              >
                <Badge className={getStatusColor('Completed')}>Completed</Badge>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      
      <TableCell>
        <div className="w-[120px] flex items-center gap-2">
          <Progress value={currentProject.progress} className="h-2 flex-grow" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentProject.progress}%
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className={getPriorityColor(currentProject.priority)}>
          {currentProject.priority}
        </Badge>
      </TableCell>
      
      <TableCell>
        {currentProject.package_name ? (
          <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
            <Package className="h-3 w-3 shrink-0" />
            <span className="truncate">{currentProject.package_name}</span>
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">No package</span>
        )}
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
          {formatRevenue(currentProject.revenue)}
        </Badge>
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">{formatDate(currentProject.start_date)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(currentProject.due_date)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('View details', currentProject.id)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', currentProject.id)}>
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setSelectedProjects([currentProject.id]);
                setShowDeleteModal(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </UITableRow>
  );
}
