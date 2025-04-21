
import { FilterBar } from "../FilterBar";

interface ProjectListFilterBarProps {
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

export function ProjectListFilterBar(props: ProjectListFilterBarProps) {
  return <FilterBar {...props} />;
}
