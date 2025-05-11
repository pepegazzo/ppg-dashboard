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
      <TableHead className="w-[40px] p-4 align-middle">
        <div className="flex items-center h-full justify-center">
          <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all projects" />
        </div>
      </TableHead>
      <TableHead onClick={() => onSort('name')} className="w-[200px] p-4">
        <div className="flex items-left">Project {renderSortIndicator('name')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('client_name')} className="w-[160px] p-4">
        <div className="flex items-left">Client {renderSortIndicator('client_name')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('status')} className="w-[120px] p-4">
        <div className="flex items-left">Status {renderSortIndicator('status')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('progress')} className="w-[200px] p-4">
        <div className="flex items-left">Progress {renderSortIndicator('progress')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('priority')} className="w-[120px] p-4">
        <div className="flex items-left">Priority {renderSortIndicator('priority')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('package_name')} className="w-[120px] p-4">
        <div className="flex items-left">Service {renderSortIndicator('package_name')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('start_date')} className="w-[120px] p-4">
        <div className="flex items-left">Start {renderSortIndicator('start_date')}</div>
      </TableHead>
      <TableHead onClick={() => onSort('due_date')} className="w-[120px] p-4">
        <div className="flex items-left">End {renderSortIndicator('due_date')}</div>
      </TableHead>
      <TableHead className="w-[80px] p-4">Portal</TableHead>
      <TableHead className="w-[60px] p-[10px] text-center">Details</TableHead>
    </TableRow>
  </TableHeader>;
}