
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProjectFormValues } from "./types";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectRevenueFieldProps {
  control: Control<ProjectFormValues>;
}

export function ProjectRevenueField({ control }: ProjectRevenueFieldProps) {
  return (
    <FormField
      control={control}
      name="revenue"
      render={({ field }) => (
        <FormItem className="h-full flex flex-col">
          <div className="flex items-center gap-2">
            <FormLabel>Revenue (S/)</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Revenue is automatically calculated from invoices and will be updated when invoices are added, 
                    modified, or deleted.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FormControl>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">S/</span>
              </div>
              <Input 
                type="number"
                placeholder="0.00" 
                className="pl-10 h-10" 
                {...field} 
                value={field.value || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
