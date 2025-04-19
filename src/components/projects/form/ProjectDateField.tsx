
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Control } from "react-hook-form";
import { ProjectFormValues } from "./types";

interface ProjectDateFieldProps {
  control: Control<ProjectFormValues>;
  name: "start_date" | "due_date";
  label: string;
}

export function ProjectDateField({ control, name, label }: ProjectDateFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full min-w-[120px] pl-3 text-left justify-start font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 z-50" 
              align="start" 
              sideOffset={12}
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Format the date in UTC to avoid timezone issues
                    const year = date.getUTCFullYear();
                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(date.getUTCDate()).padStart(2, '0');
                    field.onChange(`${year}-${month}-${day}`);
                  }
                }}
                initialFocus
                className="pointer-events-auto"
                classNames={{
                  day: cn(
                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-left cursor-pointer"
                  ),
                  caption: "flex justify-start pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-left"
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
