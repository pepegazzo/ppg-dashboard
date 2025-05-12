
import { useMemo } from "react";
import { Project, SortableProjectField, SortDirection } from "../types";

interface UseFilteredSortedProjectsArgs {
  projects: Project[];
  searchFilter: string;
  statusFilter: string;
  priorityFilter: string;
  sortField: SortableProjectField;
  sortDirection: SortDirection;
}

export function useFilteredSortedProjects({
  projects,
  searchFilter,
  statusFilter,
  priorityFilter,
  sortField,
  sortDirection,
}: UseFilteredSortedProjectsArgs): Project[] {
  return useMemo(() => {
    let result = projects.filter(project => {
      // Search in multiple fields with the single search filter
      const searchLower = searchFilter.toLowerCase();
      const searchMatch = searchFilter === '' || 
        project.name.toLowerCase().includes(searchLower) || 
        (project.client_name && project.client_name.toLowerCase().includes(searchLower)) ||
        (project.package_name && project.package_name.toLowerCase().includes(searchLower)) ||
        (project.status && project.status.toLowerCase().includes(searchLower)) ||
        (project.priority && project.priority.toLowerCase().includes(searchLower));
        
      const statusMatch = !statusFilter || statusFilter === "all" || project.status === statusFilter;
      const priorityMatch = !priorityFilter || priorityFilter === "all" || project.priority === priorityFilter;
      
      return searchMatch && statusMatch && priorityMatch;
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
  }, [projects, searchFilter, statusFilter, priorityFilter, sortField, sortDirection]);
}
