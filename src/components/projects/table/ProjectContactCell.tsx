
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { useState } from "react";

interface ProjectContactCellProps {
  projectId: string;
  clientId: string | null;
  contactId: string | null;
  setUpdatingProjectId: (projectId: string | null) => void;
  updatingProjectId: string | null;
  fetchProjects?: () => void;
}

export function ProjectContactCell({
  projectId,
  clientId,
  contactId,
  setUpdatingProjectId,
  updatingProjectId,
  fetchProjects
}: ProjectContactCellProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localContactId, setLocalContactId] = useState(contactId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all contacts for the client
  const { data: clientContacts, isLoading } = useQuery({
    queryKey: ['client-contacts', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase.from('contacts')
        .select('id, name, email, role')
        .eq('company_id', clientId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });

  // Current contact info
  const currentContact = clientContacts?.find((c: any) => c.id === localContactId);

  const updateProjectContact = async (newContactId: string | null) => {
    try {
      setIsSubmitting(true);
      setUpdatingProjectId(projectId);

      const { error } = await supabase
        .from('projects')
        .update({ contact_id: newContactId })
        .eq('id', projectId);

      if (error) throw error;

      setLocalContactId(newContactId);

      toast({
        title: "Project updated",
        description: newContactId && clientContacts
          ? `Contact set to ${clientContacts.find((c:any) => c.id === newContactId)?.name || "Unknown"}`
          : "No contact assigned to this project."
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-contacts'] });
      if (fetchProjects) fetchProjects();
    } catch (error) {
      setLocalContactId(contactId);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setUpdatingProjectId(null);
    }
  };

  if (!clientId) {
    return (
      <TableCell className="text-sm text-muted-foreground italic">No client</TableCell>
    );
  }

  if (isLoading) {
    return (
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading contacts...
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-muted px-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {currentContact
              ? currentContact.name
              : "No Contact"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem
            onClick={() => updateProjectContact(null)}
            disabled={isSubmitting || !localContactId}
          >
            No Contact
            {!localContactId && (
              <Badge variant="secondary" className="ml-2">Current</Badge>
            )}
          </DropdownMenuItem>
          {clientContacts?.map((contact: any) => (
            <DropdownMenuItem
              key={contact.id}
              onClick={() => updateProjectContact(contact.id)}
              disabled={isSubmitting}
            >
              <span className="flex-1">
                {contact.name}
              </span>
              {localContactId === contact.id && (
                <Badge variant="secondary" className="ml-2">Current</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  );
}

