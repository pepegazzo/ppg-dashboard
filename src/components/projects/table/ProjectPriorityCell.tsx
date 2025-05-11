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
  return (
    <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 rounded-full w-fit border border-zinc-300 bg-zinc-100 text-zinc-800 inline-flex items-center gap-1">
      {priority}
    </Badge>
  );
}