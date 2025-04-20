
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
    <div className="p-2 bg-purple-50 border border-purple-200 rounded-md flex items-center justify-between">
      <span className="text-sm text-purple-900">
        {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDelete} 
        disabled={isDeleting}
        className="border-purple-200 text-purple-800 hover:bg-purple-50"
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
