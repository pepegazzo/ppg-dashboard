import { useState } from "react";
import { Project } from "../types";
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
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRowCollapsible } from "@/components/ui/collapsible";
interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  setShowDeleteModal: (show: boolean) => void;
  onEditProject: (project: Project) => void;
  fetchProjects?: () => void;
}
export function ProjectTableRowComponent({
  project,
  selectedProjects,
  toggleProjectSelection,
  setSelectedProjects,
  setShowDeleteModal,
  onEditProject,
  fetchProjects
}: ProjectTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleDeleteClick = () => {
    setSelectedProjects([project.id]);
    setShowDeleteModal(true);
  };
  const handleEditClick = () => {
    onEditProject(project);
  };
  return <>
      <UITableRow className={`hover:bg-muted/30 transition-colors ${isExpanded ? 'bg-muted/10' : ''}`}>
        <TableCell className="w-[40px] p-2">
          <Checkbox checked={selectedProjects.includes(project.id)} onCheckedChange={() => toggleProjectSelection(project.id)} aria-label={`Select project ${project.name}`} />
        </TableCell>
        <TableCell className="font-medium w-[200px] p-4">
          <span>{project.name}</span>
        </TableCell>
        <TableCell className="w-[200px] p-4">
          <span>{project.client_name || "No Client"}</span>
        </TableCell>
        <TableCell className="w-[150px] p-4">
          <ProjectStatusCell project={project} readOnly={true} />
        </TableCell>
        <TableCell className="w-[200px] p-4">
          <ProjectProgressCell progress={project.progress || 0} />
        </TableCell>
        <TableCell className="w-[120px] p-4">
          <ProjectPriorityCell priority={project.priority} />
        </TableCell>
        <TableCell className="w-[150px] p-2">
          <ProjectPackageCell project={project} readOnly={true} />
        </TableCell>
        <TableCell className="text-sm w-[100px] p-2">
          <ProjectDateCell date={project.start_date} readOnly={true} />
        </TableCell>
        <TableCell className="text-sm w-[100px] p-2">
          <ProjectDateCell date={project.due_date} readOnly={true} />
        </TableCell>
        <TableCell className="w-[80px] p-2">
          <ProjectActionsCell projectId={project.id} projectPassword={project.portal_password || ""} projectSlug={project.slug || ""} setShowDeleteModal={setShowDeleteModal} setSelectedProjects={setSelectedProjects} onEditProject={() => handleEditClick()} />
        </TableCell>
        <TableCell className="w-[60px] p-2 text-center">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted" onClick={() => setIsExpanded(!isExpanded)} aria-label={isExpanded ? "Collapse details" : "Expand details"}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TableCell>
      </UITableRow>
      
      {isExpanded && <ProjectExpandedDetails project={project} />}
    </>;
}

// Export with the original name for backward compatibility
export const TableRow = ProjectTableRowComponent;