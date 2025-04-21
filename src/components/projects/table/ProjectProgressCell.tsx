
import { TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ProjectProgressCellProps {
  progress: number;
}

export function ProjectProgressCell({ progress }: ProjectProgressCellProps) {
  return (
    <TableCell>
      <div className="w-[120px] flex items-center gap-2">
        <Progress value={progress} className="h-2 flex-grow" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {progress}%
        </span>
      </div>
    </TableCell>
  );
}
