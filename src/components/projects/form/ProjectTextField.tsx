
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { ProjectFormValues } from "./types";

interface ProjectTextFieldProps {
  control: Control<ProjectFormValues>;
  name: "name" | "client_name" | "slug";
  label: string;
  placeholder: string;
}

export function ProjectTextField({ control, name, label, placeholder }: ProjectTextFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="h-full flex flex-col">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder} 
              {...field} 
              className="h-10" 
              autoComplete="off" 
              value={field.value} 
              onChange={(e) => {
                // For slug field, enforce lowercase and only allow letters, numbers, and hyphens
                if (name === "slug") {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                  field.onChange(value);
                } else {
                  field.onChange(e.target.value);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
