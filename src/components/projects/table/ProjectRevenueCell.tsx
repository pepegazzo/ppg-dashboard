
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Check, X } from "lucide-react";
import { useState } from "react";

interface ProjectRevenueCellProps {
  revenue?: number | null;
  projectId?: string;
  isUpdating?: boolean;
  updateProjectField?: (projectId: string, field: string, value: string) => void;
}

export function ProjectRevenueCell({ revenue, projectId, isUpdating, updateProjectField }: ProjectRevenueCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(revenue?.toString() || "");

  const formatRevenue = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${amount.toFixed(2)}`;
  };

  const getRevenueColor = () => {
    if (!revenue || revenue === 0) return "bg-gray-50 text-gray-700 border-gray-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const handleSave = () => {
    if (projectId && updateProjectField) {
      updateProjectField(projectId, "revenue", editValue);
      setIsEditing(false);
    }
  };

  const isEditable = !!projectId && !!updateProjectField;

  return (
    <TableCell>
      {isEditable && isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-24 h-8 py-1"
            placeholder="0.00"
            autoFocus
          />
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave} disabled={isUpdating}>
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(false)} disabled={isUpdating}>
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      ) : (
        <Badge
          variant="outline"
          className={`${getRevenueColor()} w-fit ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={isEditable ? () => setIsEditing(true) : undefined}
        >
          {isUpdating ? (
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Updating...
            </span>
          ) : (
            formatRevenue(revenue)
          )}
        </Badge>
      )}
    </TableCell>
  );
}
