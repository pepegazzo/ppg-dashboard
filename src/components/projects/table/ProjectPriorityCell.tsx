import { Badge } from "@/components/ui/badge";
interface ProjectPriorityCellProps {
  priority: string;
}
export function ProjectPriorityCell({
  priority
}: ProjectPriorityCellProps) {
  return (
    <Badge variant="table">
      {priority}
    </Badge>
  );
}