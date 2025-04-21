
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
    <TableBodyRow>
      <TableCell className="p-0 w-12">
        <Checkbox
          checked={selectedProjects.includes(localProject.id)}
          onCheckedChange={() => toggleProjectSelection(localProject.id)}
          aria-label="Select project"
          className="ml-4"
        />
      </TableCell>
      <ProjectNameCell
        project={localProject}
        isUpdating={isUpdating}
        updateProjectField={updateProjectField}
      />
      <ProjectClientCell
        clientName={localProject.client_name}
        clientId={localProject.client_id}
      />
      <ProjectStatusCell
        status={localProject.status}
        projectId={localProject.id}
        isUpdating={isUpdating}
        updateProjectField={updateProjectField}
      />
      <ProjectPriorityCell
        priority={localProject.priority}
        projectId={localProject.id}
        isUpdating={isUpdating}
        updateProjectField={updateProjectField}
      />
      <ProjectDateCell
        label="Start"
        date={localProject.start_date}
        projectId={localProject.id}
        field="start_date"
        isUpdating={isUpdating}
        updateProjectField={updateProjectField}
      />
      <ProjectDateCell
        label="Due"
        date={localProject.due_date}
        projectId={localProject.id}
        field="due_date"
        isUpdating={isUpdating}
        updateProjectField={updateProjectField}
      />
      <ProjectPackageCell
        packageName={localProject.package_name}
        packageId={localProject.package_id}
      />
      <ProjectRevenueCell
        revenue={localProject.revenue}
        projectId={localProject.id}
        isUpdating={isUpdating}
        updateProjectField={updateProjectField}
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
    </TableBodyRow>
  );
}

// Import all required components and types at the top of the file
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableBodyRow } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/components/projects/types";
import { supabase } from "@/integrations/supabase/client";
import { ProjectNameCell } from "./ProjectNameCell";
import { ProjectClientCell } from "./ProjectClientCell";
import { ProjectStatusCell } from "./ProjectStatusCell";
import { ProjectPriorityCell } from "./ProjectPriorityCell";
import { ProjectDateCell } from "./ProjectDateCell";
import { ProjectPackageCell } from "./ProjectPackageCell";
import { ProjectRevenueCell } from "./ProjectRevenueCell";
import { ProjectProgressCell } from "./ProjectProgressCell";
import { ProjectActionsCell } from "./ProjectActionsCell";

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
