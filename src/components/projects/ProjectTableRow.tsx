
import { useState } from "react";
import { Project } from "./types";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Package, Loader2, Check, X, CalendarIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ProjectNameCell } from "./table/ProjectNameCell";
import { ProjectClientCell } from "./table/ProjectClientCell";
import { ProjectStatusCell } from "./table/ProjectStatusCell";
import { ProjectProgressCell } from "./table/ProjectProgressCell";
import { ProjectPriorityCell } from "./table/ProjectPriorityCell";
import { ProjectPackageCell } from "./table/ProjectPackageCell";
import { ProjectRevenueCell } from "./table/ProjectRevenueCell";
import { ProjectDateCell } from "./table/ProjectDateCell";
import { ProjectActionsCell } from "./table/ProjectActionsCell";
import { ProjectContactCell } from "./table/ProjectContactCell";

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
  fetchProjects
}: ProjectTableRowProps) {
  const { toast } = useToast();

  const [localProject, setLocalProject] = useState<Project>(project);
  
  const updateProjectField = async (projectId: string, field: string, value: string) => {
    try {
      setUpdatingProjectId(projectId);
      const updateData: Record<string, any> = {
        [field]: value
      };
      const { data, error } = await supabase.from('projects').update(updateData).eq('id', projectId).select();
      if (error) {
        console.error(`Error updating project ${field}:`, error);
        toast({
          title: `Error updating ${field}`,
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
        return;
      }
      if (data && data[0]) {
        const updatedProject = {
          ...localProject,
          [field]: data[0][field]
        };
        setLocalProject(updatedProject);
        console.log(`Project ${field} updated:`, data[0][field]);
        toast({
          title: `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} updated`,
          description: `Project ${field.replace('_', ' ')} has been updated`
        });
      }
    } catch (err) {
      console.error(`Unexpected error updating ${field}:`, err);
      toast({
        title: `Error updating ${field}`,
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const handleDeleteClick = () => {
    setSelectedProjects([localProject.id]);
    setShowDeleteModal(true);
  };

  const isUpdating = updatingProjectId === localProject.id;

  return (
    <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="w-auto p-[6px]">
        <Checkbox checked={selectedProjects.includes(localProject.id)} onCheckedChange={() => toggleProjectSelection(localProject.id)} aria-label={`Select project ${localProject.name}`} />
      </TableCell>
      
      <TableCell className="font-medium">
        <ProjectNameCell 
          name={localProject.name} 
          fieldName="name" 
          projectId={localProject.id} 
          value={localProject.name}
          updatingProjectId={updatingProjectId}
          setUpdatingProjectId={setUpdatingProjectId}
          onUpdate={updateProjectField}
        />
      </TableCell>
      
      <ProjectClientCell 
        clientName={localProject.client_name} 
        projectId={localProject.id} 
      />

      <ProjectContactCell
        projectId={localProject.id}
        clientId={localProject.client_id}
        contactId={localProject.contact_id}
        setUpdatingProjectId={setUpdatingProjectId}
        updatingProjectId={updatingProjectId}
        fetchProjects={fetchProjects}
      />

      <ProjectStatusCell 
        project={localProject} 
        updatingProjectId={updatingProjectId} 
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      
      <ProjectProgressCell progress={localProject.progress || 0} />
      
      <ProjectPriorityCell priority={localProject.priority} />
      
      <ProjectPackageCell 
        project={localProject}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      
      <ProjectRevenueCell revenue={localProject.revenue} />
      
      <TableCell className="text-sm text-muted-foreground justify-items-center">
        <ProjectDateCell 
          date={localProject.start_date} 
          fieldName="start_date" 
          projectId={localProject.id} 
          onUpdate={updateProjectField} 
          updatingProjectId={updatingProjectId} 
          setUpdatingProjectId={setUpdatingProjectId}
        />
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        <ProjectDateCell 
          date={localProject.due_date} 
          fieldName="due_date" 
          projectId={localProject.id} 
          onUpdate={updateProjectField} 
          updatingProjectId={updatingProjectId}
          setUpdatingProjectId={setUpdatingProjectId}
        />
      </TableCell>
      
      <TableCell className="text-left px-[10px]">
        <ProjectActionsCell 
          projectId={localProject.id} 
          setShowDeleteModal={setShowDeleteModal}
          setSelectedProjects={setSelectedProjects}
        />
      </TableCell>
    </UITableRow>
  );
}

