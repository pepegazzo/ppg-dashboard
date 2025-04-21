
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ProjectPriorityCellProps {
  priority: string;
  projectId?: string;
  isUpdating?: boolean;
  updateProjectField?: (projectId: string, field: string, value: string) => void;
}

export function ProjectPriorityCell({ priority, projectId, isUpdating, updateProjectField }: ProjectPriorityCellProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const updatePriority = (newPriority: string) => {
    if (projectId && updateProjectField) {
      updateProjectField(projectId, "priority", newPriority);
      setIsPopoverOpen(false);
    }
  };

  const isEditable = !!projectId && !!updateProjectField;

  return (
    <TableCell>
      {isEditable ? (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
              <Badge className={getPriorityColor(priority)}>
                {isUpdating ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating...
                  </span>
                ) : priority}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="sm" className={`justify-start ${priority === 'Low' ? 'bg-blue-50' : ''}`} onClick={() => updatePriority('Low')} disabled={isUpdating}>
                <Badge className={getPriorityColor('Low')}>Low</Badge>
              </Button>
              <Button variant="ghost" size="sm" className={`justify-start ${priority === 'Medium' ? 'bg-blue-50' : ''}`} onClick={() => updatePriority('Medium')} disabled={isUpdating}>
                <Badge className={getPriorityColor('Medium')}>Medium</Badge>
              </Button>
              <Button variant="ghost" size="sm" className={`justify-start ${priority === 'High' ? 'bg-blue-50' : ''}`} onClick={() => updatePriority('High')} disabled={isUpdating}>
                <Badge className={getPriorityColor('High')}>High</Badge>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Badge className={getPriorityColor(priority)}>
          {priority}
        </Badge>
      )}
    </TableCell>
  );
}
