
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProjectFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ProjectFormActions({ isSubmitting, onCancel }: ProjectFormActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Project
      </Button>
    </div>
  );
}
