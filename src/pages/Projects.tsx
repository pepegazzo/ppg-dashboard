import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project, PackageType } from "@/components/projects/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import ProjectForm from "@/components/projects/ProjectForm";
import { ProjectList } from "@/components/projects/list";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchPackageTypes();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting to fetch projects from Supabase...");

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          portal_password,
          project_packages(
            package_id,
            package_types(id, name, description)
          )
        `);

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

        const { data: allProjects, error: allProjectsError } = await supabase
          .from('projects')
          .select('*, portal_password');

        if (allProjectsError) {
          console.error('Error fetching all projects:', allProjectsError);
          setError(`Failed to load projects: ${allProjectsError.message}`);
          setProjects([]);
          return;
        }

        console.log("Found projects without packages:", allProjects);

        const projectsWithProgress = allProjects?.map(project => ({
          ...project,
          progress: Math.floor(Math.random() * 101)
        })) || [];

        setProjects(projectsWithProgress);
      } else {
        console.log(`Found ${data.length} projects with packages:`, data);

        // Group packages by project
        const projectPackageMap = new Map();
        
        data.forEach(project => {
          if (project.project_packages && project.project_packages.length > 0) {
            const packageNames = project.project_packages
              .filter(pp => pp.package_types)
              .map(pp => pp.package_types.name);
            
            projectPackageMap.set(project.id, {
              package_id: project.project_packages[0]?.package_types?.id || null,
              package_name: project.project_packages[0]?.package_types?.name || null,
              package_names: packageNames,
              package_ids: project.project_packages.map(pp => pp.package_types?.id).filter(Boolean)
            });
          }
        });

        const transformedProjects = data.map(project => {
          const packageInfo = projectPackageMap.get(project.id) || {};

          return {
            ...project,
            package_name: packageInfo.package_name || null,
            package_id: packageInfo.package_id || null,
            package_names: packageInfo.package_names || [],
            package_ids: packageInfo.package_ids || [],
            progress: Math.floor(Math.random() * 101)
          };
        });

        console.log("Transformed projects:", transformedProjects);
        setProjects(transformedProjects);

        const { data: projectsWithoutPackages, error: withoutPackagesError } = await supabase
          .from('projects')
          .select('*, portal_password')
          .not('id', 'in', transformedProjects.map(p => p.id));

        if (!withoutPackagesError && projectsWithoutPackages && projectsWithoutPackages.length > 0) {
          console.log("Found projects without packages:", projectsWithoutPackages);

          const projectsWithProgress = projectsWithoutPackages.map(project => ({
            ...project,
            progress: Math.floor(Math.random() * 101),
            package_names: [],
            package_ids: []
          }));

          setProjects([...transformedProjects, ...projectsWithProgress]);
        }
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

  const fetchPackageTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('package_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching package types:', error);
        return;
      }
      
      setPackageTypes(data || []);
    } catch (error) {
      console.error('Unexpected error fetching package types:', error);
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

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit bg-zinc-100 text-zinc-800">Management</span>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-zinc-900">Projects</h1>
            <div className="flex gap-2">
              <PrimaryButton onClick={() => setIsCreating(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </PrimaryButton>
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
          <ProjectList
            projects={projects}
            loading={loading}
            error={error}
            packageTypes={packageTypes}
            fetchProjects={fetchProjects}
            testCreateProject={testCreateProject}
            setIsCreating={setIsCreating}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
