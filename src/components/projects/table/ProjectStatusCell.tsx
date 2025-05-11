
import { Badge } from "@/components/ui/badge";

interface ProjectStatusCellProps {
  project: any;
  readOnly: boolean;
}

export function ProjectStatusCell({ project, readOnly }: ProjectStatusCellProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-emerald-100 text-emerald-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Badge className={getStatusColor(project.status)}>
      {project.status}
    </Badge>
  );
}
