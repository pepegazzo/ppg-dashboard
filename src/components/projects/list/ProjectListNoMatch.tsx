
import { Button } from "@/components/ui/button";

interface ProjectListNoMatchProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  resetFilters: () => void;
}

export function ProjectListNoMatch({
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  resetFilters,
}: ProjectListNoMatchProps) {
  return (
    <div className="text-center py-12 border rounded-lg bg-background">
      <h3 className="text-lg font-medium mb-2">No matching projects found</h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your search or filter criteria
      </p>
      <div className="flex justify-center gap-4">
        {searchFilter && (
          <Button variant="outline" onClick={() => setSearchFilter("")}>
            Clear search
          </Button>
        )}
        {(statusFilter !== "all" || priorityFilter !== "all" || searchFilter) && (
          <Button onClick={resetFilters}>Reset all filters</Button>
        )}
      </div>
    </div>
  );
}
