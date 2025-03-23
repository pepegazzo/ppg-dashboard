
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/projects/ProjectCard";
import { Project, ProjectStatus } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProjectForm from "@/components/projects/ProjectForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/db/projects";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch projects from Supabase
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (project: Omit<Project, 'id' | 'createdAt'>) => createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (project: Project) => updateProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleAddNewProject = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const handleSaveProject = (project: Project | Omit<Project, 'id' | 'createdAt'>) => {
    if ('id' in project) {
      updateProjectMutation.mutate(project as Project);
    } else {
      createProjectMutation.mutate(project);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const filteredProjects = projects.filter(project => {
    // Apply search filter
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">
            Management
          </span>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-zinc-900">Projects</h1>
            <Button onClick={handleAddNewProject}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as ProjectStatus | "All")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Onboarding">Onboarding</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error loading projects: {error.message}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={handleProjectClick}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredProjects.length === 0 && (
          <div className="border border-dashed border-zinc-300 rounded-lg h-[50vh] flex flex-col items-center justify-center">
            <p className="text-zinc-500 mb-4">
              {searchTerm || statusFilter !== "All" 
                ? "No projects found matching your criteria" 
                : "No projects yet"}
            </p>
            <Button variant="outline" onClick={handleAddNewProject}>
              <Plus className="mr-2 h-4 w-4" /> Create a new project
            </Button>
          </div>
        )}

        {/* Project Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm 
              project={selectedProject}
              onSave={handleSaveProject}
              onDelete={selectedProject ? () => handleDeleteProject(selectedProject.id) : undefined}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
