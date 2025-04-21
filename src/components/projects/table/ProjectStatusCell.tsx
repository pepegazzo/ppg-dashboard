
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ProjectStatusCellProps {
  project: any;
  updatingProjectId: string | null;
  setUpdatingProjectId: (id: string | null) => void;
  onUpdate: (projectId: string, field: string, value: string) => void;
}

export function ProjectStatusCell({ project, updatingProjectId, setUpdatingProjectId, onUpdate }: ProjectStatusCellProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const updateStatus = (status: string) => {
    setUpdatingProjectId(project.id);
    onUpdate(project.id, "status", status);
    setIsPopoverOpen(false);
  };

  return (
    <TableCell>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
            <Badge className={getStatusColor(project.status)}>
              {updatingProjectId === project.id
                ? <span className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating...
                  </span>
                : project.status}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" className={`justify-start ${project.status === 'Onboarding' ? 'bg-blue-50' : ''}`} onClick={() => updateStatus('Onboarding')} disabled={updatingProjectId === project.id}>
              <Badge className={getStatusColor('Onboarding')}>Onboarding</Badge>
            </Button>
            <Button variant="ghost" size="sm" className={`justify-start ${project.status === 'Active' ? 'bg-blue-50' : ''}`} onClick={() => updateStatus('Active')} disabled={updatingProjectId === project.id}>
              <Badge className={getStatusColor('Active')}>Active</Badge>
            </Button>
            <Button variant="ghost" size="sm" className={`justify-start ${project.status === 'Completed' ? 'bg-blue-50' : ''}`} onClick={() => updateStatus('Completed')} disabled={updatingProjectId === project.id}>
              <Badge className={getStatusColor('Completed')}>Completed</Badge>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}
