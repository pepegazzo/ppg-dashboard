import { useState } from "react";
import { Project } from "../types";
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
import { ProjectContactCell } from "./ProjectContactCell";

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
      <TableCell className="px-2 py-0 w-[28px]">
        <Checkbox checked={selectedProjects.includes(localProject.id)} onCheckedChange={() => toggleProjectSelection(localProject.id)} aria-label={`Select project ${localProject.name}`} />
      </TableCell>
      <TableCell className="font-medium px-[10px]">
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
      <TableCell className="text-sm text-muted-foreground justify-items-center px-[10px]">
        <ProjectDateCell 
          date={localProject.start_date} 
          fieldName="start_date" 
          projectId={localProject.id} 
          onUpdate={updateProjectField} 
          updatingProjectId={updatingProjectId} 
          setUpdatingProjectId={setUpdatingProjectId}
        />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground px-[10px]">
        <ProjectDateCell 
          date={localProject.due_date} 
          fieldName="due_date" 
          projectId={localProject.id} 
          onUpdate={updateProjectField} 
          updatingProjectId={updatingProjectId}
          setUpdatingProjectId={setUpdatingProjectId}
        />
      </TableCell>
      <TableCell className="text-center px-[10px]">
        <ProjectActionsCell 
          projectId={localProject.id} 
          projectPassword={localProject.portal_password || ""}
          projectSlug={localProject.slug || ""}
          setShowDeleteModal={setShowDeleteModal}
          setSelectedProjects={setSelectedProjects}
        />
      </TableCell>
    </UITableRow>;
}
