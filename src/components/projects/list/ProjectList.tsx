import { useState } from "react";
import { Project, PackageType, SortDirection, SortableProjectField } from "../types";
import { TableRow } from "../table/ProjectTableRow";
import { ProjectTableHeader } from "../table/ProjectTableHeader";
import { EmptyState } from "../EmptyState";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProjectListFilterBar } from "./ProjectListFilterBar";
import { SelectedProjectsActions } from "./SelectedProjectsActions";
import { useFilteredSortedProjects } from "./useFilteredSortedProjects";
import { ProjectListLoading } from "./ProjectListLoading";
import { ProjectListError } from "./ProjectListError";
import { ProjectListEmpty } from "./ProjectListEmpty";
import { ProjectListNoMatch } from "./ProjectListNoMatch";
import { ProjectTable } from "./ProjectTable";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  packageTypes: PackageType[];
  fetchProjects: () => void;
  testCreateProject: () => void;
  setIsCreating: (isCreating: boolean) => void;
}

export function ProjectList({
  projects,
  loading,
  error,
  packageTypes,
  fetchProjects,
  testCreateProject,
  setIsCreating,
}: ProjectListProps) {
  const [sortField, setSortField] = useState<SortableProjectField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [nameFilter, setNameFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);

  const handleSort = (field: SortableProjectField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setNameFilter('');
    setClientFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const filteredAndSortedProjects = useFilteredSortedProjects({
    projects,
    nameFilter,
    clientFilter,
    statusFilter,
    priorityFilter,
    sortField,
    sortDirection,
  });

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === filteredAndSortedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredAndSortedProjects.map(p => p.id));
    }
  };

  if (loading) {
    return <ProjectListLoading />;
  }

  if (error) {
    return <ProjectListError error={error} fetchProjects={fetchProjects} />;
  }

  if (projects.length === 0) {
    return (
      <ProjectListEmpty
        setIsCreating={setIsCreating}
        fetchProjects={fetchProjects}
        testCreateProject={testCreateProject}
      />
    );
  }

  if (filteredAndSortedProjects.length === 0) {
    return (
      <ProjectListNoMatch
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        resetFilters={resetFilters}
      />
    );
  }

  return (
    <div>
      <ProjectListFilterBar
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        resetFilters={resetFilters}
      />

      {selectedProjects.length > 0 && (
        <SelectedProjectsActions
          count={selectedProjects.length}
          isDeleting={isDeleting}
          onDelete={() => setShowDeleteModal(true)}
        />
      )}

      <ProjectTable
        projects={filteredAndSortedProjects}
        selectedProjects={selectedProjects}
        toggleProjectSelection={toggleProjectSelection}
        setSelectedProjects={setSelectedProjects}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        setShowDeleteModal={setShowDeleteModal}
        fetchProjects={fetchProjects}
        handleSort={handleSort}
        handleSelectAllProjects={handleSelectAllProjects}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      <DeleteConfirmDialog
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        fetchProjects={fetchProjects}
      />
    </div>
  );
}
