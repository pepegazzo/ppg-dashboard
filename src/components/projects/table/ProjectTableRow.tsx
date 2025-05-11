
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
import { ProjectDateCell } from "./ProjectDateCell";
import { ProjectActionsCell } from "./ProjectActionsCell";
import { ProjectClientCell } from "./ProjectClientCell";
import { ProjectExpandedDetails } from "./ProjectExpandedDetails";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function ProjectTableRowComponent({
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <>
      <UITableRow className={`hover:bg-muted/30 transition-colors ${isExpanded ? 'bg-muted/10' : ''}`}>
        <TableCell className="w-[40px] px-2 py-0">
          <Checkbox 
            checked={selectedProjects.includes(localProject.id)} 
            onCheckedChange={() => toggleProjectSelection(localProject.id)} 
            aria-label={`Select project ${localProject.name}`} 
          />
        </TableCell>
        <TableCell className="font-medium w-[200px] px-[10px]">
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
        <TableCell className="w-[150px] px-[10px]">
          <ProjectClientCell 
            clientName={localProject.client_name} 
            projectId={localProject.id} 
          />
        </TableCell>
        <TableCell className="w-[120px] px-[10px]">
          <ProjectStatusCell 
            project={localProject} 
            updatingProjectId={updatingProjectId} 
            setUpdatingProjectId={setUpdatingProjectId}
            onUpdate={updateProjectField}
          />
        </TableCell>
        <TableCell className="w-[100px] px-[10px]">
          <ProjectProgressCell progress={localProject.progress || 0} />
        </TableCell>
        <TableCell className="w-[100px] px-[10px]">
          <ProjectPriorityCell priority={localProject.priority} />
        </TableCell>
        <TableCell className="w-[130px] px-[10px]">
          <ProjectPackageCell 
            project={localProject}
            updatingProjectId={updatingProjectId}
            setUpdatingProjectId={setUpdatingProjectId}
            onUpdate={updateProjectField}
          />
        </TableCell>
        <TableCell className="text-sm w-[100px] text-muted-foreground px-[10px]">
          <ProjectDateCell 
            date={localProject.start_date} 
            fieldName="start_date" 
            projectId={localProject.id} 
            onUpdate={updateProjectField} 
            updatingProjectId={updatingProjectId} 
            setUpdatingProjectId={setUpdatingProjectId}
          />
        </TableCell>
        <TableCell className="text-sm w-[100px] text-muted-foreground px-[10px]">
          <ProjectDateCell 
            date={localProject.due_date} 
            fieldName="due_date" 
            projectId={localProject.id} 
            onUpdate={updateProjectField} 
            updatingProjectId={updatingProjectId}
            setUpdatingProjectId={setUpdatingProjectId}
          />
        </TableCell>
        <TableCell className="w-[100px] px-[10px]">
          <ProjectActionsCell 
            projectId={localProject.id} 
            projectPassword={localProject.portal_password || ""}
            projectSlug={localProject.slug || ""}
            setShowDeleteModal={setShowDeleteModal}
            setSelectedProjects={setSelectedProjects}
          />
        </TableCell>
        <TableCell className="w-[60px] px-[10px]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </TableCell>
      </UITableRow>
      
      {isExpanded && (
        <ProjectExpandedDetails project={localProject} />
      )}
    </>
  );
}

// Export with the original name for backward compatibility
export const TableRow = ProjectTableRowComponent;
