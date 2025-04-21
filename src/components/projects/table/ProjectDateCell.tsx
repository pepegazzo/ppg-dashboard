
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProjectDateCellProps {
  date: string | null;
  fieldName: string;
  projectId: string;
  onUpdate: (projectId: string, field: string, value: string) => void;
  updatingProjectId: string | null;
  setUpdatingProjectId: (id: string | null) => void;
}

export function ProjectDateCell({ date, fieldName, projectId, onUpdate, updatingProjectId, setUpdatingProjectId }: ProjectDateCellProps) {
  const [editMode, setEditMode] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleDateSelect = (dateObj: Date | undefined) => {
    if (dateObj) {
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onUpdate(projectId, fieldName, formattedDate);
      setPopoverOpen(false);
      setEditMode(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString || '-';
    }
  };

  return (
    <TableCell>
      <div onDoubleClick={() => setEditMode(true)}>
        {editMode ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(parseISO(date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date ? parseISO(date) : undefined}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <span className="cursor-pointer">
            {fieldName === "start_date" ? "Start: " : "Due: "}
            {formatDate(date)}
          </span>
        )}
      </div>
    </TableCell>
  );
}
