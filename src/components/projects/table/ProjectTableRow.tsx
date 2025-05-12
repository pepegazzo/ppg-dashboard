
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
import { ProjectContactCell } from "./ProjectContactCell";

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
  const handleDeleteClick = () => {
    setSelectedProjects([project.id]);
    setShowDeleteModal(true);
  };
  
  const handleEditClick = () => {
    onEditProject(project);
  };
  
  // Process packages for the project
  const enhancedProject = {
    ...project,
    packages: project.package_names || []
  };

  return (
    <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="w-[40px] p-4 align-middle">
        <div className="flex items-center h-full justify-center">
          <Checkbox checked={selectedProjects.includes(project.id)} onCheckedChange={() => toggleProjectSelection(project.id)} aria-label={`Select project ${project.name}`} />
        </div>
      </TableCell>
      <TableCell className="font-medium w-[200px] p-4">
        <span>{project.name}</span>
      </TableCell>
      <TableCell className="w-[160px] p-4">
        <span>{project.client_name || "No Client"}</span>
      </TableCell>
      <TableCell className="w-[160px] p-4">
        <span>{project.contact_name || "No Contact"}</span>
      </TableCell>
      <TableCell className="w-[120px] p-4">
        <ProjectStatusCell project={project} readOnly={true} />
      </TableCell>
      <TableCell className="w-[200px] p-4">
        <ProjectProgressCell progress={project.progress || 0} />
      </TableCell>
      <TableCell className="w-[120px] p-4">
        <ProjectPriorityCell priority={project.priority} />
      </TableCell>
      <TableCell className="w-[120px] p-4">
        <ProjectPackageCell project={enhancedProject} readOnly={true} />
      </TableCell>
      <TableCell className="w-[120px] p-4">
        <ProjectDateCell date={project.start_date} readOnly={true} />
      </TableCell>
      <TableCell className="w-[120px] p-4">
        <ProjectDateCell date={project.due_date} readOnly={true} />
      </TableCell>
      <TableCell className="w-[80px] p-4">
        <ProjectActionsCell projectId={project.id} projectPassword={project.portal_password || ""} projectSlug={project.slug || ""} setShowDeleteModal={setShowDeleteModal} setSelectedProjects={setSelectedProjects} onEditProject={() => handleEditClick()} />
      </TableCell>
    </UITableRow>
  );
}

// Export with the original name for backward compatibility
export const TableRow = ProjectTableRowComponent;
