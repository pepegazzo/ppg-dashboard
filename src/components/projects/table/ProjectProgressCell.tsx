
import { Progress } from "@/components/ui/progress";

interface ProjectProgressCellProps {
  progress: number;
}

export function ProjectProgressCell({ progress }: ProjectProgressCellProps) {
  return (
    <div className="w-full flex items-center gap-2">
      <Progress value={progress} className="h-2.5 flex-grow" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {progress}%
      </span>
    </div>
  );
}
