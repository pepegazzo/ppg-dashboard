
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Loader2 } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Fetched projects:", data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error fetching projects",
        description: "Please try again later.",
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

  const renderTableView = () => {
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
                <TableCell>{project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : '-'}</TableCell>
                <TableCell>{project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : '-'}</TableCell>
                <TableCell>{format(new Date(project.created_at), 'MMM d, yyyy')}</TableCell>
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
            <Button onClick={() => setIsCreating(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
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
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-zinc-300 rounded-lg h-64 flex flex-col items-center justify-center">
            <p className="text-zinc-500 mb-4">No projects found</p>
            <Button onClick={() => setIsCreating(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first project
            </Button>
          </div>
        ) : renderTableView()}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
