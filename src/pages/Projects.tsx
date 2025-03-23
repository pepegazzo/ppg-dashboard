import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Loader2, Info, ChevronUp, ChevronDown, Search, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import ProjectForm from "@/components/projects/ProjectForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Database } from "@/integrations/supabase/types";

type Project = {
  id: string;
  name: string;
  client_name: string;
  status: 'Onboarding' | 'Active' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  start_date: string | null;
  due_date: string | null;
  slug: string | null;
  created_at: string;
};

type SortField = keyof Project;
type SortDirection = 'asc' | 'desc';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const { toast } = useToast();

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [nameFilter, setNameFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Supabase Client:", supabase);
      console.log("Attempting to fetch projects from Supabase...");
      
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) {
        console.error('Error fetching projects:', error);
        setError(`Failed to load projects: ${error.message}`);
        toast({
          title: "Error fetching projects",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Raw Supabase response:", data);
      
      if (!data || data.length === 0) {
        console.log("No projects found in the database");
        const { data: sqlData, error: sqlError } = await supabase.rpc(
          'debug_get_projects',
          {},
          { count: 'exact' }
        );
        console.log("SQL debug query result:", sqlData, sqlError);
        setProjects([]);
      } else {
        console.log(`Found ${data.length} projects:`, data);
        setProjects(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError("An unexpected error occurred while fetching projects.");
      toast({
        title: "Error fetching projects",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setNameFilter('');
    setClientFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const updateProjectStatus = async (projectId: string, newStatus: Database["public"]["Enums"]["project_status"]) => {
    try {
      setUpdatingProjectId(projectId);
      
      const { data, error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)
        .select();
      
      if (error) {
        console.error('Error updating project status:', error);
        toast({
          title: "Error updating status",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId ? { ...project, status: newStatus } : project
        )
      );
      
      toast({
        title: "Status updated",
        description: `Project status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      toast({
        title: "Error updating status",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter(project => {
      const nameMatch = project.name.toLowerCase().includes(nameFilter.toLowerCase());
      const clientMatch = project.client_name.toLowerCase().includes(clientFilter.toLowerCase());
      const statusMatch = !statusFilter || statusFilter === "all" || project.status === statusFilter;
      const priorityMatch = !priorityFilter || priorityFilter === "all" || project.priority === priorityFilter;
      
      return nameMatch && clientMatch && statusMatch && priorityMatch;
    });

    return result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      if (fieldA === null && fieldB === null) return 0;
      if (fieldA === null) return sortDirection === 'asc' ? 1 : -1;
      if (fieldB === null) return sortDirection === 'asc' ? -1 : 1;

      const compareResult = String(fieldA).localeCompare(String(fieldB));
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [projects, nameFilter, clientFilter, statusFilter, priorityFilter, sortField, sortDirection]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onboarding': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleFormSubmitted = () => {
    setIsCreating(false);
    fetchProjects();
    toast({
      title: "Project created",
      description: "Your new project has been created successfully.",
    });
  };

  const handleRefreshProjects = () => {
    fetchProjects();
    toast({
      title: "Refreshing projects",
      description: "Attempting to fetch the latest projects.",
    });
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

  const testCreateProject = async () => {
    try {
      const testProject = {
        name: "Test Project",
        client_name: "Test Client",
        status: "Onboarding" as const,
        priority: "Medium" as const,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(testProject)
        .select();
      
      if (error) {
        console.error("Error creating test project:", error);
        toast({
          title: "Error creating test project",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Test project created:", data);
        toast({
          title: "Test project created",
          description: "A test project was created successfully.",
        });
        fetchProjects();
      }
    } catch (error) {
      console.error("Unexpected error creating test project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the test project.",
        variant: "destructive",
      });
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? 
        <ChevronUp className="ml-1 h-4 w-4 inline" /> : 
        <ChevronDown className="ml-1 h-4 w-4 inline" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 inline opacity-40" />;
  };

  const renderEmptyState = () => (
    <div className="border border-dashed border-zinc-300 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-zinc-100 p-3 rounded-full">
          <Info className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">No projects found</h3>
        <p className="text-zinc-500 max-w-md">
          You haven't created any projects yet. Get started by creating your first project.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create your first project
          </Button>
          <Button variant="outline" onClick={handleRefreshProjects}>
            Refresh Projects
          </Button>
          <Button variant="secondary" onClick={testCreateProject}>
            Create Test Project
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFilterBar = () => (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by project name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Filter by client name..."
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        />
      </div>
      <div className="w-[180px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Onboarding">Onboarding</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-[180px]">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" onClick={resetFilters} className="shrink-0">
        ✕
      </Button>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading projects</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchProjects}>
            Try Again
          </Button>
        </div>
      );
    }

    if (projects.length === 0) {
      return renderEmptyState();
    }

    if (filteredAndSortedProjects.length === 0) {
      return (
        <div>
          {renderFilterBar()}
          <div className="text-center p-8 border rounded-md">
            <h3 className="text-lg font-medium mb-2">No matching projects</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results.</p>
            <Button variant="outline" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        {renderFilterBar()}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                  Project Name {renderSortIndicator('name')}
                </TableHead>
                <TableHead onClick={() => handleSort('client_name')} className="cursor-pointer">
                  Client {renderSortIndicator('client_name')}
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                  Status {renderSortIndicator('status')}
                </TableHead>
                <TableHead onClick={() => handleSort('priority')} className="cursor-pointer">
                  Priority {renderSortIndicator('priority')}
                </TableHead>
                <TableHead onClick={() => handleSort('start_date')} className="cursor-pointer">
                  Start Date {renderSortIndicator('start_date')}
                </TableHead>
                <TableHead onClick={() => handleSort('due_date')} className="cursor-pointer">
                  Due Date {renderSortIndicator('due_date')}
                </TableHead>
                <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
                  Created {renderSortIndicator('created_at')}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.client_name}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
                          <Badge className={getStatusColor(project.status)}>
                            {updatingProjectId === project.id ? (
                              <span className="flex items-center">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Updating...
                              </span>
                            ) : (
                              project.status
                            )}
                          </Badge>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`justify-start ${project.status === 'Onboarding' ? 'bg-blue-50' : ''}`}
                            onClick={() => updateProjectStatus(project.id, 'Onboarding')}
                            disabled={updatingProjectId === project.id}
                          >
                            <Badge className={getStatusColor('Onboarding')}>Onboarding</Badge>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`justify-start ${project.status === 'Active' ? 'bg-blue-50' : ''}`}
                            onClick={() => updateProjectStatus(project.id, 'Active')}
                            disabled={updatingProjectId === project.id}
                          >
                            <Badge className={getStatusColor('Active')}>Active</Badge>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`justify-start ${project.status === 'Completed' ? 'bg-blue-50' : ''}`}
                            onClick={() => updateProjectStatus(project.id, 'Completed')}
                            disabled={updatingProjectId === project.id}
                          >
                            <Badge className={getStatusColor('Completed')}>Completed</Badge>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(project.start_date)}</TableCell>
                  <TableCell>{formatDate(project.due_date)}</TableCell>
                  <TableCell>{formatDate(project.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log('View details', project.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Edit', project.id)}>
                          Edit Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">Management</span>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-zinc-900">Projects</h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreating(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button variant="outline" onClick={handleRefreshProjects}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        {isCreating ? (
          <Card>
            <CardContent className="pt-6">
              <ProjectForm 
                onCancel={() => setIsCreating(false)} 
                onSubmitted={handleFormSubmitted}
              />
            </CardContent>
          </Card>
        ) : (
          renderContent()
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
