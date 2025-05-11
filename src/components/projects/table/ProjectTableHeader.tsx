
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
    <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs">
      <TableHead className="w-[40px] px-2 py-0 text-left">
        <Checkbox checked={allSelected} onCheckedChange={onSelectAll} aria-label="Select all projects" />
      </TableHead>
      <TableHead onClick={() => onSort('name')} className="cursor-pointer w-[200px] px-[10px] text-left">
        Project {renderSortIndicator('name')}
      </TableHead>
      <TableHead onClick={() => onSort('client_name')} className="cursor-pointer w-[150px] px-[10px] text-left">
        Client {renderSortIndicator('client_name')}
      </TableHead>
      <TableHead onClick={() => onSort('status')} className="cursor-pointer w-[120px] px-[10px] text-left">
        Status {renderSortIndicator('status')}
      </TableHead>
      <TableHead onClick={() => onSort('progress')} className="cursor-pointer w-[100px] px-[10px] text-left">
        Progress {renderSortIndicator('progress')}
      </TableHead>
      <TableHead onClick={() => onSort('priority')} className="cursor-pointer w-[100px] px-[10px] text-left">
        Priority {renderSortIndicator('priority')}
      </TableHead>
      <TableHead onClick={() => onSort('package_name')} className="cursor-pointer w-[130px] px-[10px] text-left">
        Service {renderSortIndicator('package_name')}
      </TableHead>
      <TableHead onClick={() => onSort('start_date')} className="cursor-pointer w-[100px] px-[10px] text-left">
        Start {renderSortIndicator('start_date')}
      </TableHead>
      <TableHead onClick={() => onSort('due_date')} className="cursor-pointer w-[100px] px-[10px] text-left">
        End {renderSortIndicator('due_date')}
      </TableHead>
      <TableHead className="w-[100px] px-[10px] text-left">Portal</TableHead>
      <TableHead className="w-[60px] px-[10px]"></TableHead>
    </TableRow>
  </TableHeader>;
}
