import { Badge } from "@/components/ui/badge";
interface ProjectPriorityCellProps {
  priority: string;
}
export function ProjectPriorityCell({
  priority
}: ProjectPriorityCellProps) {
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {priority}
    </Badge>
  );
}