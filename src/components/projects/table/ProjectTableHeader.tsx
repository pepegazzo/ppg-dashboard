import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableProjectField, SortDirection } from "../types";
interface ProjectTableHeaderProps {
  onSelectAll: () => void;
  allSelected: boolean;
  onSort: (field: SortableProjectField) => void;
  sortField: SortableProjectField;
  sortDirection: SortDirection;
}
export function ProjectTableHeader({
  onSelectAll,
  allSelected,
  onSort,
  sortField,
  sortDirection
}: ProjectTableHeaderProps) {
  const renderSortIndicator = (field: SortableProjectField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <span className="ml-1 inline-flex items-center">↑</span> : <span className="ml-1 inline-flex items-center">↓</span>;
    }
    return <span className="ml-1 inline-flex items-center opacity-40">↕</span>;
  };
  return <TableHeader>
    <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs">
      <TableHead className="w-[40px] p-2">
        <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all projects" />
      </TableHead>
      <TableHead onClick={() => onSort('name')} className="w-[200px] p-2">
        <div className="flex items-left">Project {renderSortIndicator('name')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('client_name')} className="w-[200px] p-2">
        <div className="flex items-left">Client {renderSortIndicator('client_name')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('status')} className="w-[100px] p-2">
        <div className="flex items-left">Status {renderSortIndicator('status')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('progress')} className="cursor-pointer w-[100px] p-[10px] text-left">
        <div className="flex items-center">Progress {renderSortIndicator('progress')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('priority')} className="cursor-pointer w-[100px] p-[10px] text-left">
        <div className="flex items-center">Priority {renderSortIndicator('priority')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('package_name')} className="cursor-pointer min-w-[130px] p-[10px] text-left">
        <div className="flex items-center">Service {renderSortIndicator('package_name')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('start_date')} className="cursor-pointer w-[100px] p-[10px] text-left">
        <div className="flex items-center">Start {renderSortIndicator('start_date')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('due_date')} className="cursor-pointer w-[100px] p-[10px] text-left">
        <div className="flex items-center">End {renderSortIndicator('due_date')}</div>
      </TableHead>
      <TableHead className="w-[80px] p-[10px] text-left">Portal</TableHead>
      <TableHead className="w-[60px] p-[10px] text-center">Details</TableHead>
    </TableRow>
  </TableHeader>;
}