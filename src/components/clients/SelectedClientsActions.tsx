
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface SelectedClientsActionsProps {
  selectedCount: number;
  isDeleting: boolean;
  onDelete: () => void;
}

export const SelectedClientsActions = ({
  selectedCount,
  isDeleting,
  onDelete
}: SelectedClientsActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
      <span className="text-sm text-amber-900">
        {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDelete} 
        disabled={isDeleting}
        className="border-amber-200 text-amber-800 hover:bg-amber-50"
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
};
