import { Badge } from "@/components/ui/badge";

interface ProjectStatusCellProps {
  project: any;
  readOnly: boolean;
}

export function ProjectStatusCell({ project, readOnly }: ProjectStatusCellProps) {
  return (
    <Badge variant="table">
      {project.status}
    </Badge>
  );
}
