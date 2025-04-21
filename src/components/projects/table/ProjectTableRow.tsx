
import { useState, useEffect } from "react";
import { Project } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectNameCell } from "./ProjectNameCell";
import { ProjectStatusCell } from "./ProjectStatusCell";
import { ProjectProgressCell } from "./ProjectProgressCell";
import { ProjectPriorityCell } from "./ProjectPriorityCell";
import { ProjectPackageCell } from "./ProjectPackageCell";
import { ProjectRevenueCell } from "./ProjectRevenueCell";
import { ProjectDateCell } from "./ProjectDateCell";
import { ProjectActionsCell } from "./ProjectActionsCell";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  updatingProjectId: string | null;
  setUpdatingProjectId: (projectId: string | null) => void;
  setShowDeleteModal: (show: boolean) => void;
  fetchProjects?: () => void;
}

export function TableRow({
  project,
  selectedProjects,
  toggleProjectSelection,
  setSelectedProjects,
  updatingProjectId,
  setUpdatingProjectId,
  setShowDeleteModal,
  fetchProjects
}: ProjectTableRowProps) {
  const { toast } = useToast();
  const [localProject, setLocalProject] = useState<Project>(project);
  const [clientContacts, setClientContacts] = useState<{id: string, name: string}[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (localProject.client_name && localProject.client_id) {
      setLoadingContacts(true);
      supabase
        .from("contacts")
        .select("id, name")
        .eq("company_id", localProject.client_id)
        .then(({ data }) => {
          setClientContacts(data ?? []);
          setLoadingContacts(false);
        });
    }
  }, [localProject.client_name, localProject.client_id]);

  const updateContact = async (contactId: string) => {
    try {
      setUpdatingProjectId(localProject.id);
      const { data, error } = await supabase
        .from('projects')
        .update({ contact_id: contactId })
        .eq('id', localProject.id)
        .select();
      if (error) {
        toast({
          title: "Error updating contact person",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      let contactNameDisplay = "";
      if (contactId) {
        const { data: cdata } = await supabase
          .from("contacts")
          .select("name")
          .eq("id", contactId)
          .maybeSingle();
        contactNameDisplay = cdata?.name ?? "";
      }
      setLocalProject(prev => ({
        ...prev,
        contact_id: contactId,
        contact_name: contactNameDisplay
      }));
      toast({
        title: "Contact updated",
        description: "Project's contact person has been changed."
      });
      if (fetchProjects) fetchProjects();
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const updateProjectField = async (projectId: string, field: string, value: string) => {
    try {
      setUpdatingProjectId(projectId);
      const updateData: Record<string, any> = {
        [field]: value
      };
      const { data, error } = await supabase.from('projects').update(updateData).eq('id', projectId).select();
      if (error) {
        console.error(`Error updating project ${field}:`, error);
        toast({
          title: `Error updating ${field}`,
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
        return;
      }
      if (data && data[0]) {
        const updatedProject = {
          ...localProject,
          [field]: data[0][field]
        };
        setLocalProject(updatedProject);
        console.log(`Project ${field} updated:`, data[0][field]);
        toast({
          title: `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} updated`,
          description: `Project ${field.replace('_', ' ')} has been updated`
        });
      }
    } catch (err) {
      console.error(`Unexpected error updating ${field}:`, err);
      toast({
        title: `Error updating ${field}`,
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const handleDeleteClick = () => {
    setSelectedProjects([localProject.id]);
    setShowDeleteModal(true);
  };

  const isUpdating = updatingProjectId === localProject.id;

  return (
    <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <Checkbox checked={selectedProjects.includes(localProject.id)} onCheckedChange={() => toggleProjectSelection(localProject.id)} aria-label={`Select project ${localProject.name}`} />
      </TableCell>
      
      <TableCell className="font-medium">
        <ProjectNameCell 
          name={localProject.name} 
          fieldName="name" 
          projectId={localProject.id} 
          value={localProject.name}
          updatingProjectId={updatingProjectId}
          setUpdatingProjectId={setUpdatingProjectId}
          onUpdate={updateProjectField}
        />
      </TableCell>
      
      <TableCell className="text-sm">
        {localProject.client_name || "No Client"}
      </TableCell>
      
      <TableCell className="text-sm min-w-[180px]">
        <Select 
          value={localProject.contact_id ?? ""}
          onValueChange={updateContact}
          disabled={loadingContacts || !clientContacts.length || isUpdating}
        >
          <SelectTrigger className="w-full">
            <SelectValue 
              placeholder={loadingContacts ? "Loading..." : clientContacts.length === 0 ? "No contacts" : "Select contact"} 
            />
          </SelectTrigger>
          <SelectContent>
            {clientContacts.length === 0 ? (
              <SelectItem value="no-contacts" disabled>No contacts</SelectItem>
            ) : (
              clientContacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </TableCell>
      
      <ProjectStatusCell 
        project={localProject} 
        updatingProjectId={updatingProjectId} 
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      
      <ProjectProgressCell progress={localProject.progress || 0} />
      
      <ProjectPriorityCell priority={localProject.priority} />
      
      <ProjectPackageCell 
        project={localProject}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      
      <ProjectRevenueCell revenue={localProject.revenue} />
      
      <TableCell className="text-sm text-muted-foreground justify-items-center">
        <ProjectDateCell 
          date={localProject.start_date} 
          fieldName="start_date" 
          projectId={localProject.id} 
          onUpdate={updateProjectField} 
          updatingProjectId={updatingProjectId} 
          setUpdatingProjectId={setUpdatingProjectId}
        />
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        <ProjectDateCell 
          date={localProject.due_date} 
          fieldName="due_date" 
          projectId={localProject.id} 
          onUpdate={updateProjectField} 
          updatingProjectId={updatingProjectId}
          setUpdatingProjectId={setUpdatingProjectId}
        />
      </TableCell>
      
      <TableCell className="text-center">
        <ProjectActionsCell 
          projectId={localProject.id} 
          setShowDeleteModal={setShowDeleteModal}
          setSelectedProjects={setSelectedProjects}
        />
      </TableCell>
    </UITableRow>
  );
}
