
import { useState } from "react";
import { Project, PackageType, SortDirection, SortableProjectField } from "../types";
import { useFilteredSortedProjects } from "./useFilteredSortedProjects";
import { ProjectListFilterBar } from "./ProjectListFilterBar";
import { SelectedProjectsActions } from "./SelectedProjectsActions";
import { ProjectTable } from "./ProjectTable";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { ProjectListLoading } from "./ProjectListLoading";
import { ProjectListError } from "./ProjectListError";
import { ProjectListEmpty } from "./ProjectListEmpty";
import { ProjectListNoMatch } from "./ProjectListNoMatch";
import { ProjectEditDialog } from "../ProjectEditDialog";

interface ProjectListContainerProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  packageTypes: PackageType[];
  fetchProjects: () => void;
  testCreateProject: () => void;
  setIsCreating: (isCreating: boolean) => void;
}

export function ProjectListContainer({
  projects,
  loading,
  error,
  packageTypes,
  fetchProjects,
  testCreateProject,
  setIsCreating,
}: ProjectListContainerProps) {
  const [sortField, setSortField] = useState<SortableProjectField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSort = (field: SortableProjectField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const filteredAndSortedProjects = useFilteredSortedProjects({
    projects,
    searchFilter,
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

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleEditSelected = () => {
    if (selectedProjects.length === 1) {
      const projectToEdit = projects.find(p => p.id === selectedProjects[0]);
      if (projectToEdit) {
        setEditingProject(projectToEdit);
        setShowEditModal(true);
      }
    }
  };

  if (loading) return <ProjectListLoading />;
  if (error) return <ProjectListError error={error} fetchProjects={fetchProjects} />;
  if (projects.length === 0)
    return (
      <ProjectListEmpty
        setIsCreating={setIsCreating}
        fetchProjects={fetchProjects}
        testCreateProject={testCreateProject}
      />
    );

  return (
    <div>
      <ProjectListFilterBar
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
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
          onEdit={handleEditSelected}
          canEdit={selectedProjects.length === 1}
        />
      )}

      {filteredAndSortedProjects.length > 0 ? (
        <ProjectTable
          projects={filteredAndSortedProjects}
          selectedProjects={selectedProjects}
          toggleProjectSelection={toggleProjectSelection}
          setSelectedProjects={setSelectedProjects}
          setShowDeleteModal={setShowDeleteModal}
          onEditProject={handleEditProject}
          fetchProjects={fetchProjects}
          handleSort={handleSort}
          handleSelectAllProjects={handleSelectAllProjects}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      ) : (
        <ProjectListNoMatch
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          resetFilters={resetFilters}
        />
      )}

      <DeleteConfirmDialog
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        fetchProjects={fetchProjects}
      />

      <ProjectEditDialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
        project={editingProject}
        onProjectUpdated={fetchProjects}
      />
    </div>
  );
}
