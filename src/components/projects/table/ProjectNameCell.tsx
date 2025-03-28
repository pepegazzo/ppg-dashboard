
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface ProjectNameCellProps {
  name: string;
  fieldName: "name" | "client_name";
  projectId: string;
  onUpdateField: (projectId: string, field: string, value: string) => Promise<void>;
  disabled: boolean;
}

export function ProjectNameCell({
  name,
  fieldName,
  projectId,
  onUpdateField,
  disabled
}: ProjectNameCellProps) {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(name);

  const startEdit = () => {
    if (!disabled) {
      setEditMode(true);
      setValue(name);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setValue(name);
  };

  const saveEdit = () => {
    onUpdateField(projectId, fieldName, value);
    setEditMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div onDoubleClick={startEdit}>
      {editMode ? (
        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="py-1 h-9"
          />
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={saveEdit}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={cancelEdit}
            >
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
