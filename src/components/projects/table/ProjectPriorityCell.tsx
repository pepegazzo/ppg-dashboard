import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
interface ProjectPriorityCellProps {
  priority: string;
}
export function ProjectPriorityCell({
  priority
}: ProjectPriorityCellProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  return <TableCell className="Deparent this div from its children, and delete the parent\n">
      <Badge variant="outline" className={getPriorityColor(priority)}>
        {priority}
      </Badge>
    </TableCell>;
}