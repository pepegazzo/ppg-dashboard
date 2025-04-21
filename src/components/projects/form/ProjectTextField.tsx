
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
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} autoComplete="off" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
