
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface ProjectNameCellProps {
  name: string;
  projectId: string;
  fieldName: 'name' | 'slug';
  value: string;
  updatingProjectId: string | null;
  setUpdatingProjectId: (id: string | null) => void;
  onUpdate: (projectId: string, field: string, value: string) => void;
}

const formatSlug = (value: string): string => {
  // Convert to lowercase
  let formatted = value.toLowerCase();
  // Replace spaces and special characters with hyphens
  formatted = formatted.replace(/[^a-z0-9-]/g, '-');
  // Replace multiple consecutive hyphens with a single one
  formatted = formatted.replace(/-+/g, '-');
  // Remove leading and trailing hyphens
  formatted = formatted.replace(/^-+|-+$/g, '');
  return formatted;
};

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

  const handleSave = () => {
    let finalValue = editValue.trim();
    
    if (fieldName === 'slug') {
      // For slug, ensure it's properly formatted
      finalValue = formatSlug(finalValue);
      
      // If slug is empty, fall back to formatted project name
      if (!finalValue) {
        finalValue = formatSlug(name);
      }
    }

    // Only update if the value has actually changed
    if (finalValue !== value) {
      onUpdate(projectId, fieldName, finalValue);
    }
    
    setEditMode(false);
  };

  return (
    <TableCell>
      <div onDoubleClick={() => setEditMode(true)}>
        {editMode ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              className="py-1 h-9"
              placeholder={fieldName === 'name' ? "Enter project name" : "Enter portal slug"}
            />
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSave}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setEditValue(value);
                  setEditMode(false);
                }}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <span className="cursor-pointer">{name}</span>
        )}
      </div>
    </TableCell>
  );
}
