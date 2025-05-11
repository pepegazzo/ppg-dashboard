import { Badge } from "@/components/ui/badge";
interface ProjectPriorityCellProps {
  priority: string;
}
export function ProjectPriorityCell({
  priority
}: ProjectPriorityCellProps) {
  return (
    <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 rounded-full w-fit border border-zinc-300 bg-zinc-100 text-zinc-800 inline-flex items-center gap-1">
      {priority}
    </Badge>
  );
}