
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface SelectedProjectsActionsProps {
  count: number;
  isDeleting: boolean;
  onDelete: () => void;
}

export function SelectedProjectsActions({
  count,
  isDeleting,
  onDelete,
}: SelectedProjectsActionsProps) {
  return (
    <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between">
      <span className="text-sm">
        {count} project{count !== 1 ? 's' : ''} selected
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </>
        )}
      </Button>
    </div>
  );
}
