
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/components/projects/types";
import { supabase } from "@/integrations/supabase/client";
import { ProjectNameCell } from "./table/ProjectNameCell";
import { ProjectClientCell } from "./table/ProjectClientCell";
import { ProjectStatusCell } from "./table/ProjectStatusCell";
import { ProjectPriorityCell } from "./table/ProjectPriorityCell";
import { ProjectDateCell } from "./table/ProjectDateCell";
import { ProjectPackageCell } from "./table/ProjectPackageCell";
import { ProjectRevenueCell } from "./table/ProjectRevenueCell";
import { ProjectProgressCell } from "./table/ProjectProgressCell";
import { ProjectActionsCell } from "./table/ProjectActionsCell";

// Define the props interface
interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  updatingProjectId: string | null;
  setUpdatingProjectId: (projectId: string | null) => void;
  setShowDeleteModal: (show: boolean) => void;
  fetchProjects: () => void;
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
      
      // Special handling for slug to ensure it's properly formatted
      if (field === 'slug') {
        // Convert to lowercase
        let formatted = value.toLowerCase();
        // Replace spaces and special characters with hyphens
        formatted = formatted.replace(/[^a-z0-9-]/g, '-');
        // Replace multiple consecutive hyphens with a single one
        formatted = formatted.replace(/-+/g, '-');
        // Remove leading and trailing hyphens
        formatted = formatted.replace(/^-+|-+$/g, '');
        
        updateData[field] = formatted;
        value = formatted;
      }

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
  
  // Add the missing implementation for the TableRow component
  return (
    <TableRow>
      <TableCell className="p-0 w-12">
        <Checkbox
          checked={selectedProjects.includes(localProject.id)}
          onCheckedChange={() => toggleProjectSelection(localProject.id)}
          aria-label="Select project"
          className="ml-4"
        />
      </TableCell>
      <ProjectNameCell
        name={localProject.name} 
        projectId={localProject.id}
        fieldName="name"
        value={localProject.name}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      <ProjectClientCell
        clientName={localProject.client_name}
        projectId={localProject.id}
      />
      <ProjectStatusCell
        project={localProject}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      <ProjectPriorityCell
        priority={localProject.priority}
      />
      <ProjectDateCell
        date={localProject.start_date}
        fieldName="start_date"
        projectId={localProject.id}
        onUpdate={updateProjectField}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
      />
      <ProjectDateCell
        date={localProject.due_date}
        fieldName="due_date"
        projectId={localProject.id}
        onUpdate={updateProjectField}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
      />
      <ProjectPackageCell
        project={localProject}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      <ProjectRevenueCell
        revenue={localProject.revenue}
      />
      <ProjectProgressCell progress={localProject.progress} />
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
          <ProjectActionsCell
            projectId={localProject.id}
            setShowDeleteModal={setShowDeleteModal}
            setSelectedProjects={setSelectedProjects}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
