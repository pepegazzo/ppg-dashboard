
import { TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ProjectProgressCellProps {
  progress: number;
}

export function ProjectProgressCell({ progress }: ProjectProgressCellProps) {
  return (
    <TableCell className="p-2">
      <div className="w-[95px] flex items-center gap-1">
        <Progress value={progress} className="h-1 flex-grow" />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {progress}%
        </span>
      </div>
    </TableCell>
  );
}
