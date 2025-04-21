
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface ProjectNameCellProps {
  name: string;
  projectId: string;
  fieldName: string;
  value: string;
  updatingProjectId: string | null;
  setUpdatingProjectId: (id: string | null) => void;
  onUpdate: (projectId: string, field: string, value: string) => void;
}

export function ProjectNameCell({ 
  name, 
  projectId, 
  fieldName, 
  value, 
  updatingProjectId, 
  setUpdatingProjectId, 
  onUpdate 
}: ProjectNameCellProps) {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(value);

  return (
    <div onDoubleClick={() => setEditMode(true)}>
      {editMode ? (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            autoFocus
            className="py-1 h-9"
          />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                onUpdate(projectId, fieldName, editValue);
                setEditMode(false);
              }}>
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditMode(false)}>
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      ) : (
        <span className="cursor-pointer">{name}</span>
      )}
    </div>
  );
}
