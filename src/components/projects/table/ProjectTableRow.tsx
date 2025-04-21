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
import { Key, Link as LinkIcon, Copy } from "lucide-react";

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

function CopyButton({ value, label }: { value: string; label?: string }) {
  const { toast } = useToast();
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${label || "Value"} copied to clipboard`,
    });
  };
  return (
    <button className="ml-2" title={label} onClick={handleCopy}>
      <Copy className="h-4 w-4 inline" />
    </button>
  );
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

  const shareUrl = project.slug ? `${window.location.origin}/client-portal/${project.slug}` : "";

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
      <TableCell className="px-[10px] max-w-xs">
        {project.slug ? (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center truncate">
              <LinkIcon className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="truncate">{project.slug}</span>
              <CopyButton value={project.slug} label="Slug" />
            </div>
            <div className="flex items-center truncate">
              <Key className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="truncate">{project.portal_password}</span>
              <CopyButton value={project.portal_password ?? ""} label="Portal password" />
            </div>
            <div className="flex items-center">
              <a
                href={shareUrl}
                className="underline text-primary text-xs hover:text-primary/90"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                Open client portal
              </a>
              <CopyButton value={shareUrl} label="Client portal link" />
            </div>
          </div>
        ) : (
          <span className="italic text-muted-foreground">—</span>
        )}
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
          setShowDeleteModal={setShowDeleteModal}
          setSelectedProjects={setSelectedProjects}
        />
      </TableCell>
    </UITableRow>;
}
