
import { Button } from "@/components/ui/button";
import { ProjectListFilterBar } from "./ProjectListFilterBar";

interface ProjectListNoMatchProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  clientFilter: string;
  setClientFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  resetFilters: () => void;
}

export function ProjectListNoMatch({
  nameFilter,
  setNameFilter,
  clientFilter,
  setClientFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  resetFilters,
}: ProjectListNoMatchProps) {
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
