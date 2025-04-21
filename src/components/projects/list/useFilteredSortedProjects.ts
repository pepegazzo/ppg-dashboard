
import { useMemo } from "react";
import { Project, SortableProjectField, SortDirection } from "../types";

interface UseFilteredSortedProjectsArgs {
  projects: Project[];
  nameFilter: string;
  clientFilter: string;
  statusFilter: string;
  priorityFilter: string;
  sortField: SortableProjectField;
  sortDirection: SortDirection;
}

export function useFilteredSortedProjects({
  projects,
  nameFilter,
  clientFilter,
  statusFilter,
  priorityFilter,
  sortField,
  sortDirection,
}: UseFilteredSortedProjectsArgs): Project[] {
  return useMemo(() => {
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
}
