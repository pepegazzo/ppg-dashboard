import { useState } from "react";
import { Project } from "./types";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Package, Loader2, Check, X, CalendarIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ProjectNameCell } from "./table/ProjectNameCell";
import { ProjectClientCell } from "./table/ProjectClientCell";
import { ProjectStatusCell } from "./table/ProjectStatusCell";
import { ProjectProgressCell } from "./table/ProjectProgressCell";
import { ProjectPriorityCell } from "./table/ProjectPriorityCell";
import { ProjectPackageCell } from "./table/ProjectPackageCell";
import { ProjectRevenueCell } from "./table/ProjectRevenueCell";
import { ProjectDateCell } from "./table/ProjectDateCell";
import { ProjectActionsCell } from "./table/ProjectActionsCell";

interface ProjectTableRowProps {
  project: Project;
  selectedProjects: string[];
  toggleProjectSelection: (projectId: string) => void;
  setSelectedProjects: (projectIds: string[]) => void;
  updatingProjectId: string | null;
  setUpdatingProjectId: (projectId: string | null) => void;
  setShowDeleteModal: (show: boolean) => void;
  fetchProjects?: () => void; // Optional prop to refresh all projects
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const [editMode, setEditMode] = useState<{ 
    name: boolean; 
    client_name: boolean;
    start_date: boolean;
    due_date: boolean;
  }>({
    name: false,
    client_name: false,
    start_date: false,
    due_date: false
  });
  const [editValues, setEditValues] = useState({
    name: localProject.name,
    client_name: localProject.client_name,
    start_date: localProject.start_date || '',
    due_date: localProject.due_date || ''
  });

  const [datePopoverOpen, setDatePopoverOpen] = useState({
    start_date: false,
    due_date: false
  });

  const updateProjectStatus = async (projectId: string, newStatus: Database["public"]["Enums"]["project_status"]) => {
    try {
      setUpdatingProjectId(projectId);
      const {
        data,
        error
      } = await supabase.from('projects').update({
        status: newStatus
      }).eq('id', projectId).select();
      if (error) {
        console.error('Error updating project status:', error);
        toast({
          title: "Error updating status",
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      if (data && data[0]) {
        setLocalProject(prev => ({
          ...prev,
          status: newStatus
        }));
        setIsPopoverOpen(false);
      }
      toast({
        title: "Status updated",
        description: `Project status changed to ${newStatus}`
      });
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      toast({
        title: "Error updating status",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
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
      
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .select();
        
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
        
        setEditValues(prev => ({
          ...prev,
          [field]: data[0][field] || ''
        }));
        
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
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }));
      if (field === 'start_date' || field === 'due_date') {
        setDatePopoverOpen(prev => ({
          ...prev,
          [field]: false
        }));
      }
    }
  };

  const handleEnterKeyPress = (field: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateProjectField(localProject.id, field, editValues[field as keyof typeof editValues]);
    } else if (e.key === 'Escape') {
      cancelEdit(field as keyof typeof editMode);
    }
  };
  
  const startEdit = (field: keyof typeof editMode) => {
    setEditMode(prev => ({
      ...prev,
      [field]: true
    }));
    setEditValues(prev => ({
      ...prev,
      [field]: localProject[field] || ''
    }));
  };
  
  const cancelEdit = (field: keyof typeof editMode) => {
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
    setEditValues(prev => ({
      ...prev,
      [field]: localProject[field] || ''
    }));
    if (field === 'start_date' || field === 'due_date') {
      setDatePopoverOpen(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleDateSelect = (field: 'start_date' | 'due_date', date: Date | undefined) => {
    if (date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setEditValues(prev => ({
        ...prev,
        [field]: formattedDate
      }));
      
      updateProjectField(localProject.id, field, formattedDate);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-emerald-100 text-emerald-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatRevenue = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return `S/ ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString || '-';
    }
  };

  const currentProject = localProject;

  return (
    <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <Checkbox checked={selectedProjects.includes(currentProject.id)} onCheckedChange={() => toggleProjectSelection(currentProject.id)} aria-label={`Select project ${currentProject.name}`} />
      </TableCell>
      <ProjectNameCell
        name={currentProject.name}
        fieldName="name"
        projectId={currentProject.id}
        value={currentProject.name}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      <TableCell className="text-sm">
        <ProjectClientCell
          clientName={currentProject.client_name}
          projectId={currentProject.id}
        />
      </TableCell>
      <ProjectStatusCell
        project={currentProject}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
        onUpdate={updateProjectField}
      />
      <ProjectProgressCell progress={currentProject.progress} />
      <ProjectPriorityCell priority={currentProject.priority} />
      <ProjectPackageCell
        packageName={currentProject.package_name}
        projectId={currentProject.id}
      />
      <ProjectRevenueCell revenue={currentProject.revenue} />
      <ProjectDateCell
        date={currentProject.start_date}
        fieldName="start_date"
        projectId={currentProject.id}
        onUpdate={updateProjectField}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
      />
      <ProjectDateCell
        date={currentProject.due_date}
        fieldName="due_date"
        projectId={currentProject.id}
        onUpdate={updateProjectField}
        updatingProjectId={updatingProjectId}
        setUpdatingProjectId={setUpdatingProjectId}
      />
      <ProjectActionsCell
        projectId={currentProject.id}
        setShowDeleteModal={setShowDeleteModal}
        setSelectedProjects={setSelectedProjects}
      />
    </UITableRow>
  );
}
