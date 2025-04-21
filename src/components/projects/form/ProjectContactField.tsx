
import { useEffect, useState } from "react";
import { Control, useWatch, Controller } from "react-hook-form";
import { ProjectFormValues } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectContactFieldProps {
  control: Control<ProjectFormValues>;
}

// This field allows selecting a contact person from the chosen client company
export function ProjectContactField({ control }: ProjectContactFieldProps) {
  const clientId: string | undefined = useWatch({ control, name: "client_id" });
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setContacts([]);
      return;
    }
    setLoading(true);
    supabase
      .from("contacts")
      .select("id, name")
      .eq("company_id", clientId)
      .order("name")
      .then(({ data, error }) => {
        setContacts(data ? data : []);
        setLoading(false);
      });
  }, [clientId]);

  return (
    <Controller
      control={control}
      name="contact_id"
      render={({ field }) => (
        <div className="flex flex-col gap-2">
          <Label>Contact Person</Label>
          {!clientId ? (
            <div className="text-muted-foreground text-sm">Select client first</div>
          ) : loading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
              disabled={!clientId || loading || contacts.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={contacts.length ? "Select contact..." : "No contacts available"} />
              </SelectTrigger>
              <SelectContent>
                {contacts.length === 0 ? (
                  <SelectItem value="" disabled>No contacts</SelectItem>
                ) : (
                  contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    />
  );
}
