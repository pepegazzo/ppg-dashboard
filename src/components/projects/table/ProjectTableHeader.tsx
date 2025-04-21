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
      return sortDirection === 'asc' ? <span className="inline-flex items-center">↑</span> : <span className="inline-flex items-center">↓</span>;
    }
    return <span className="inline-flex items-center opacity-40">↕</span>;
  };
  return <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableHead className="w-[50px]">
          <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all projects" />
        </TableHead>
        <TableHead onClick={() => onSort('name')} className="cursor-pointer w-[200px]">
          Project {renderSortIndicator('name')}
        </TableHead>
        <TableHead onClick={() => onSort('client_name')} className="cursor-pointer w-[180px]">
          Client {renderSortIndicator('client_name')}
        </TableHead>
        <TableHead className="w-[150px]">Contact</TableHead>
        <TableHead onClick={() => onSort('status')} className="cursor-pointer w-[120px]">
          Status {renderSortIndicator('status')}
        </TableHead>
        <TableHead onClick={() => onSort('progress')} className="cursor-pointer w-[130px]">
          Progress {renderSortIndicator('progress')}
        </TableHead>
        <TableHead onClick={() => onSort('priority')} className="cursor-pointer w-[100px]">
          Priority {renderSortIndicator('priority')}
        </TableHead>
        <TableHead onClick={() => onSort('package_name')} className="cursor-pointer w-[100px]">
          Service {renderSortIndicator('package_name')}
        </TableHead>
        <TableHead onClick={() => onSort('revenue')} className="cursor-pointer w-[120px]">
          Revenue {renderSortIndicator('revenue')}
        </TableHead>
        <TableHead onClick={() => onSort('start_date')} className="cursor-pointer w-[80px]">
          Start {renderSortIndicator('start_date')}
        </TableHead>
        <TableHead onClick={() => onSort('due_date')} className="cursor-pointer w-[80px]">
          End {renderSortIndicator('due_date')}
        </TableHead>
        <TableHead className="text-center w-[40px]">Actions</TableHead>
      </TableRow>
    </TableHeader>;
}