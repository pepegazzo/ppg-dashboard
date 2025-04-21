
import { useState, useMemo } from "react";
import { Project, PackageType, SortDirection, SortableProjectField } from "./types";
import { TableRow } from "./table/ProjectTableRow";
import { ProjectTableHeader } from "./table/ProjectTableHeader";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Table, TableBody } from "@/components/ui/table";

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
  setIsCreating
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

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter(project => {
      const nameMatch = project.name.toLowerCase().includes(nameFilter.toLowerCase());
      const clientMatch = project.client_name 
        ? project.client_name.toLowerCase().includes(clientFilter.toLowerCase()) 
        : clientFilter === ''; // Only match null client_name when clientFilter is empty
      const statusMatch = !statusFilter || statusFilter === "all" || project.status === statusFilter;
      const priorityMatch = !priorityFilter || priorityFilter === "all" || project.priority === priorityFilter;
      return nameMatch && clientMatch && statusMatch && priorityMatch;
    });
    return result.sort((a, b) => {
      if (sortField === 'package_name') {
        const packageA = a.package_name || '';
        const packageB = b.package_name || '';
        const compareResult = packageA.localeCompare(packageB);
        return sortDirection === 'asc' ? compareResult : -compareResult;
      } else if (sortField === 'revenue') {
        const revenueA = a.revenue || 0;
        const revenueB = b.revenue || 0;
        const compareResult = revenueA - revenueB;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      } else if (sortField === 'progress') {
        const progressA = a.progress || 0;
        const progressB = b.progress || 0;
        const compareResult = progressA - progressB;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      } else {
        const fieldA = a[sortField as keyof typeof a];
        const fieldB = b[sortField as keyof typeof b];
        if (fieldA === null && fieldB === null) return 0;
        if (fieldA === null) return sortDirection === 'asc' ? 1 : -1;
        if (fieldB === null) return sortDirection === 'asc' ? -1 : 1;
        const compareResult = String(fieldA).localeCompare(String(fieldB));
        return sortDirection === 'asc' ? compareResult : -compareResult;
      }
    });
  }, [projects, nameFilter, clientFilter, statusFilter, priorityFilter, sortField, sortDirection]);

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
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error loading projects</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchProjects}>
          Try Again
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState 
        setIsCreating={setIsCreating} 
        handleRefreshProjects={fetchProjects} 
        testCreateProject={testCreateProject} 
      />
    );
  }

  if (filteredAndSortedProjects.length === 0) {
    return (
      <div>
        <FilterBar 
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
        <div className="text-center p-8 border rounded-md">
          <h3 className="text-lg font-medium mb-2">No matching projects</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results.</p>
          <Button variant="outline" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FilterBar 
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
        <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between">
          <span className="text-sm">
            {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowDeleteModal(true)} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <ProjectTableHeader 
            onSelectAll={handleSelectAllProjects}
            allSelected={filteredAndSortedProjects.length > 0 && 
                       selectedProjects.length === filteredAndSortedProjects.length}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
          
          <TableBody>
            {filteredAndSortedProjects.map(project => (
              <TableRow 
                key={project.id} 
                project={project} 
                selectedProjects={selectedProjects} 
                toggleProjectSelection={toggleProjectSelection} 
                setSelectedProjects={setSelectedProjects} 
                updatingProjectId={updatingProjectId} 
                setUpdatingProjectId={setUpdatingProjectId} 
                setShowDeleteModal={setShowDeleteModal}
                fetchProjects={fetchProjects} 
              />
            ))}
          </TableBody>
        </Table>
      </div>

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
