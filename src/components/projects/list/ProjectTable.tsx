
import { Table, TableBody } from "@/components/ui/table";
import { TableRow } from "../table/ProjectTableRow";
import { ProjectTableHeader } from "../table/ProjectTableHeader";
import { Project, SortableProjectField, SortDirection } from "../types";

interface ProjectTableProps {
  projects: Project[];
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  setShowDeleteModal: (show: boolean) => void;
  onEditProject: (project: Project) => void;
  fetchProjects: () => void;
  handleSort: (field: SortableProjectField) => void;
  handleSelectAllProjects: () => void;
  sortField: SortableProjectField;
  sortDirection: SortDirection;
}

export function ProjectTable({
  projects,
  selectedProjects,
  toggleProjectSelection,
  setSelectedProjects,
  setShowDeleteModal,
  onEditProject,
  fetchProjects,
  handleSort,
  handleSelectAllProjects,
  sortField,
  sortDirection,
}: ProjectTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <ProjectTableHeader
          onSelectAll={handleSelectAllProjects}
          allSelected={
            projects.length > 0 && selectedProjects.length === projects.length
          }
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              project={project}
              selectedProjects={selectedProjects}
              toggleProjectSelection={toggleProjectSelection}
              setSelectedProjects={setSelectedProjects}
              setShowDeleteModal={setShowDeleteModal}
              onEditProject={onEditProject}
              fetchProjects={fetchProjects}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
