
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Loader2, Info } from "lucide-react";
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

// Type definition based on the existing database schema
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check Supabase connection
      console.log("Supabase Client:", supabase);
      console.log("Attempting to fetch projects from Supabase...");
      
      // Explicitly use the 'public' schema and name the table exactly as it appears in Supabase
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
      
      // Log the raw response for debugging
      console.log("Raw Supabase response:", data);
      
      if (!data || data.length === 0) {
        console.log("No projects found in the database");
        // Try doing a direct SQL query to verify the table exists and has data
        const { data: sqlData, error: sqlError } = await supabase.rpc(
          'debug_get_projects',
          // No parameters needed for this function
          {},
          // Properly type the expected response
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

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client_name}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => console.log('View details', project.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
