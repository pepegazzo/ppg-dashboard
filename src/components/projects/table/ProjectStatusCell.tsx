import { Badge } from "@/components/ui/badge";

interface ProjectStatusCellProps {
  project: any;
  readOnly: boolean;
}

export function ProjectStatusCell({ project, readOnly }: ProjectStatusCellProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Onboarding':
        return 'warning';
      case 'Active':
        return 'success';
      case 'Completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getStatusVariant(project.status)} className="text-xs font-medium">
      {project.status}
    </Badge>
  );
}
