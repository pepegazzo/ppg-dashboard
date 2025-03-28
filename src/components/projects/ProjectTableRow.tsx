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
import { Package, Loader2, Check, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";

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

  // Add local state to track project data
  const [localProject, setLocalProject] = useState<Project>(project);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // State for inline editing
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

      // Update local project state with the new status
      if (data && data[0]) {
        setLocalProject(prev => ({
          ...prev,
          status: newStatus
        }));

        // Close the popover after successful status update
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

      // Update local project state with the new value
      if (data && data[0]) {
        setLocalProject(prev => ({
          ...prev,
          [field]: value
        }));
        
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
      // Reset edit mode
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }));
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
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString || '-';
    }
  };

  // Use localProject instead of project
  const currentProject = localProject;

  return <UITableRow className="hover:bg-muted/30 transition-colors">
      <TableCell>
        <Checkbox checked={selectedProjects.includes(currentProject.id)} onCheckedChange={() => toggleProjectSelection(currentProject.id)} aria-label={`Select project ${currentProject.name}`} />
      </TableCell>
      
      <TableCell className="font-medium" onDoubleClick={() => startEdit('name')}>
        {editMode.name ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValues.name}
              onChange={(e) => setEditValues({...editValues, name: e.target.value})}
              onKeyDown={(e) => handleEnterKeyPress('name', e)}
              autoFocus
              className="py-1 h-9"
            />
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => updateProjectField(currentProject.id, 'name', editValues.name)}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => cancelEdit('name')}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <span className="cursor-pointer">{currentProject.name}</span>
        )}
      </TableCell>
      
      <TableCell className="text-sm" onDoubleClick={() => startEdit('client_name')}>
        {editMode.client_name ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValues.client_name}
              onChange={(e) => setEditValues({...editValues, client_name: e.target.value})}
              onKeyDown={(e) => handleEnterKeyPress('client_name', e)}
              autoFocus
              className="py-1 h-9"
            />
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => updateProjectField(currentProject.id, 'client_name', editValues.client_name)}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => cancelEdit('client_name')}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <span className="cursor-pointer">{currentProject.client_name}</span>
        )}
      </TableCell>
      
      <TableCell>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
              <Badge className={getStatusColor(currentProject.status)}>
                {updatingProjectId === currentProject.id ? <span className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating...
                  </span> : currentProject.status}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="sm" className={`justify-start ${currentProject.status === 'Onboarding' ? 'bg-blue-50' : ''}`} onClick={() => updateProjectStatus(currentProject.id, 'Onboarding')} disabled={updatingProjectId === currentProject.id}>
                <Badge className={getStatusColor('Onboarding')}>Onboarding</Badge>
              </Button>
              <Button variant="ghost" size="sm" className={`justify-start ${currentProject.status === 'Active' ? 'bg-blue-50' : ''}`} onClick={() => updateProjectStatus(currentProject.id, 'Active')} disabled={updatingProjectId === currentProject.id}>
                <Badge className={getStatusColor('Active')}>Active</Badge>
              </Button>
              <Button variant="ghost" size="sm" className={`justify-start ${currentProject.status === 'Completed' ? 'bg-blue-50' : ''}`} onClick={() => updateProjectStatus(currentProject.id, 'Completed')} disabled={updatingProjectId === currentProject.id}>
                <Badge className={getStatusColor('Completed')}>Completed</Badge>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      
      <TableCell>
        <div className="w-[120px] flex items-center gap-2">
          <Progress value={currentProject.progress} className="h-2 flex-grow" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentProject.progress}%
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className={getPriorityColor(currentProject.priority)}>
          {currentProject.priority}
        </Badge>
      </TableCell>
      
      <TableCell>
        {currentProject.package_name ? <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
            <Package className="h-3 w-3 shrink-0" />
            <span className="truncate">{currentProject.package_name}</span>
          </Badge> : <span className="text-muted-foreground text-xs">No package</span>}
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
          {formatRevenue(currentProject.revenue)}
        </Badge>
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground" onDoubleClick={() => startEdit('start_date')}>
        {editMode.start_date ? (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={editValues.start_date ? editValues.start_date.split('T')[0] : ''}
              onChange={(e) => setEditValues({...editValues, start_date: e.target.value})}
              onKeyDown={(e) => handleEnterKeyPress('start_date', e)}
              autoFocus
              className="py-1 h-9 w-36"
            />
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => updateProjectField(currentProject.id, 'start_date', editValues.start_date)}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => cancelEdit('start_date')}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <span className="cursor-pointer">{formatDate(currentProject.start_date)}</span>
        )}
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground" onDoubleClick={() => startEdit('due_date')}>
        {editMode.due_date ? (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={editValues.due_date ? editValues.due_date.split('T')[0] : ''}
              onChange={(e) => setEditValues({...editValues, due_date: e.target.value})}
              onKeyDown={(e) => handleEnterKeyPress('due_date', e)}
              autoFocus
              className="py-1 h-9 w-36"
            />
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => updateProjectField(currentProject.id, 'due_date', editValues.due_date)}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => cancelEdit('due_date')}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <span className="cursor-pointer">{formatDate(currentProject.due_date)}</span>
        )}
      </TableCell>
      
      <TableCell className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('View details', currentProject.id)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', currentProject.id)}>
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
            setSelectedProjects([currentProject.id]);
            setShowDeleteModal(true);
          }} className="text-destructive focus:text-destructive">
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </UITableRow>;
}
