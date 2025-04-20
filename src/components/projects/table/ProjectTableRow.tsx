
import { useState } from "react";
import { Project } from "../types";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectNameCell } from "./ProjectNameCell";
import { ProjectStatusCell } from "./ProjectStatusCell";
import { ProjectProgressCell } from "./ProjectProgressCell";
import { ProjectPriorityCell } from "./ProjectPriorityCell";
import { ProjectPackageCell } from "./ProjectPackageCell";
import { ProjectRevenueCell } from "./ProjectRevenueCell";
import { ProjectDateCell } from "./ProjectDateCell";
import { ProjectActionsCell } from "./ProjectActionsCell";
import { ProjectClientCell } from "./ProjectClientCell";
import { Link } from "react-router-dom";

interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  updatingProjectId: string | null;
  setUpdatingProjectId: (projectId: string | null) => void;
  setShowDeleteModal: (show: boolean) => void;
  fetchProjects?: () => void;
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
      const {
        data,
        error
      } = await supabase.from('projects').update(updateData).eq('id', projectId).select();
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

  return <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <Checkbox checked={selectedProjects.includes(localProject.id)} onCheckedChange={() => toggleProjectSelection(localProject.id)} aria-label={`Select project ${localProject.name}`} />
      </TableCell>
      
      <TableCell className="font-medium">
        <ProjectNameCell name={localProject.name} fieldName="name" projectId={localProject.id} onUpdateField={updateProjectField} disabled={isUpdating} />
      </TableCell>
      
      <TableCell className="text-sm">
        <ProjectClientCell 
          clientName={localProject.client_name} 
          projectId={localProject.id} 
        />
      </TableCell>
      
      <TableCell>
        <ProjectStatusCell project={localProject} updatingProjectId={updatingProjectId} setUpdatingProjectId={setUpdatingProjectId} />
      </TableCell>
      
      <TableCell>
        <ProjectProgressCell progress={localProject.progress || 0} />
      </TableCell>
      
      <TableCell>
        <ProjectPriorityCell priority={localProject.priority} />
      </TableCell>
      
      <TableCell>
        <ProjectPackageCell 
          packageName={localProject.package_name} 
          projectId={localProject.id}
        />
      </TableCell>
      
      <TableCell>
        <ProjectRevenueCell 
          revenue={localProject.revenue} 
          projectName={localProject.name}
        />
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground justify-items-center">
        <ProjectDateCell date={localProject.start_date} fieldName="start_date" projectId={localProject.id} onUpdateDate={updateProjectField} disabled={isUpdating} />
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        <ProjectDateCell date={localProject.due_date} fieldName="due_date" projectId={localProject.id} onUpdateDate={updateProjectField} disabled={isUpdating} />
      </TableCell>
      
      <TableCell className="text-center">
        <ProjectActionsCell projectId={localProject.id} onDelete={handleDeleteClick} />
      </TableCell>
    </UITableRow>;
}
