
import { TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ProjectProgressCellProps {
  progress: number;
}

export function ProjectProgressCell({ progress }: ProjectProgressCellProps) {
  return (
    <div className="w-full flex items-center gap-2">
      <Progress value={progress} className="h-3 flex-grow" />
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {progress}%
      </span>
    </div>
  );
}
