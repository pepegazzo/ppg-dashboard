
import { Project } from "../types";
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

interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  setShowDeleteModal: (show: boolean) => void;
  onEditProject: (projectId: string) => void;
}

export function TableRow({
  project,
  selectedProjects,
  toggleProjectSelection,
  setSelectedProjects,
  setShowDeleteModal,
  onEditProject
}: ProjectTableRowProps) {
  return (
    <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <Checkbox 
          checked={selectedProjects.includes(project.id)} 
          onCheckedChange={() => toggleProjectSelection(project.id)} 
          aria-label={`Select project ${project.name}`} 
        />
      </TableCell>
      
      <TableCell className="font-medium">
        <div className="flex items-center">
          {project.name}
        </div>
      </TableCell>
      
      <TableCell>
        <ProjectClientCell 
          clientName={project.client_name} 
          projectId={project.id} 
        />
      </TableCell>
      
      <TableCell>
        <ProjectStatusCell 
          project={project}
          updatingProjectId={null}
          setUpdatingProjectId={() => {}}
          onUpdate={() => {}}
        />
      </TableCell>
      
      <TableCell>
        <ProjectProgressCell progress={project.progress || 0} />
      </TableCell>
      
      <TableCell>
        <ProjectPriorityCell priority={project.priority} />
      </TableCell>
      
      <TableCell>
        <ProjectPackageCell 
          packageName={project.package_name} 
          projectId={project.id}
        />
      </TableCell>
      
      <TableCell>
        <ProjectRevenueCell revenue={project.revenue} />
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        {project.start_date ? (
          <span>{new Date(project.start_date).toLocaleDateString()}</span>
        ) : (
          <span>-</span>
        )}
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        {project.due_date ? (
          <span>{new Date(project.due_date).toLocaleDateString()}</span>
        ) : (
          <span>-</span>
        )}
      </TableCell>
      
      <TableCell className="text-center">
        <ProjectActionsCell 
          projectId={project.id} 
          setShowDeleteModal={setShowDeleteModal}
          setSelectedProjects={setSelectedProjects}
          onEdit={onEditProject}
        />
      </TableCell>
    </UITableRow>
  );
}
