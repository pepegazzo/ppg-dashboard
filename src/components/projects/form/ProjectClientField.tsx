
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormValues } from "./types";
import { Loader2 } from "lucide-react";

interface ProjectClientFieldProps {
  control: Control<ProjectFormValues>;
}

export function ProjectClientField({ control }: ProjectClientFieldProps) {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <FormField
      control={control}
      name="client_id"
      render={({ field }) => (
        <FormItem className="h-full flex flex-col">
          <FormLabel>Client</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || 'null'} 
              disabled={isLoading}
            >
              <SelectTrigger className="h-10">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading clients...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a client (optional)" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No Client</SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
