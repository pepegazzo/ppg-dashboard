
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProjectDateCellProps {
  date: string | null;
  fieldName: "start_date" | "due_date";
  projectId: string;
  onUpdateDate: (projectId: string, field: string, value: string) => Promise<void>;
  disabled: boolean;
}

export function ProjectDateCell({ 
  date, 
  fieldName, 
  projectId, 
  onUpdateDate,
  disabled
}: ProjectDateCellProps) {
  const [editMode, setEditMode] = useState(false);
  const [dateValue, setDateValue] = useState(date || '');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MM/dd/yy');
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString || '-';
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setDateValue(formattedDate);
      onUpdateDate(projectId, fieldName, formattedDate)
        .then(() => {
          setIsPopoverOpen(false);
          setEditMode(false);
        })
        .catch(err => {
          console.error('Error updating date:', err);
        });
    }
  };

  const startEdit = () => {
    if (!disabled) {
      setEditMode(true);
      setIsPopoverOpen(true);
    }
  };

  return (
    <div className="cursor-pointer w-[80px]" onDoubleClick={startEdit}>
      {editMode ? (
        <Popover 
          open={isPopoverOpen} 
          onOpenChange={(open) => {
            setIsPopoverOpen(open);
            if (!open) {
              setEditMode(false);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[80px] justify-start text-left font-normal text-xs",
                !dateValue && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              {dateValue ? format(parseISO(dateValue), "MM/dd") : <span>Pick</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue ? parseISO(dateValue) : undefined}
              onSelect={handleDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      ) : (
        <span>{formatDate(date)}</span>
      )}
    </div>
  );
}
