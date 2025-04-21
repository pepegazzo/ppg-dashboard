
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
  // Function to format slug - ensures consistent formatting between components
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
                // For slug field, enforce proper slug format
                if (name === "slug") {
                  console.log("Formatting slug input:", e.target.value);
                  const formattedValue = formatSlug(e.target.value);
                  console.log("Formatted slug:", formattedValue);
                  field.onChange(formattedValue);
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
