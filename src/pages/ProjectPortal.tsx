import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, User, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/components/projects/types";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

interface ProjectPortalProps {
  isLegacyRoute?: boolean;
}

const ProjectPortal = ({ isLegacyRoute = false }: ProjectPortalProps) => {
  const params = useParams<{ projectSlug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const RESERVED_PATHS = [
    "login",
    "projects",
    "clients",
    "billing",
    "notes",
    "files",
    "tasks",
    "portal",
  ];

  let projectSlug = params.projectSlug;

  // Make sure we're not trying to use a reserved path as a slug
  if (!projectSlug || RESERVED_PATHS.includes(projectSlug.toLowerCase())) {
    projectSlug = undefined;
  }

  console.log("Project Portal - Using slug:", projectSlug);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"client" | "admin">("client");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const { user } = useAuth();

  // Redirect from legacy route to new format if needed
  useEffect(() => {
    if (isLegacyRoute && projectSlug) {
      navigate(`/${projectSlug}`, { replace: true });
    }
  }, [isLegacyRoute, projectSlug, navigate]);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      fetchProject();
    } else {
      fetchProject();
    }
  }, [projectSlug, user]);

  const fetchProject = async () => {
    if (!projectSlug) {
      setProject(null);
      setIsLoading(false);
      setError("Project not found or invalid URL.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching project with slug:", projectSlug);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", projectSlug)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        setError("Project not found or error loading project data.");
        setIsLoading(false);
        return;
      }

      console.log("Found project:", data);
      setProject(data as Project);
      setIsLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred while loading the project.");
      setIsLoading(false);
    }
  };

  const handleBackToAdmin = () => {
    navigate("/projects");
  };

  const handleClientAuthenticate = () => {
    if (project && project.portal_password === password) {
      setIsAuthenticated(true);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleAdminAuthenticate = async () => {
    try {
      setIsAdminLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        setError(`Admin login failed: ${error.message}`);
        setIsAdminLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setIsAdminLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred during login.");
      setIsAdminLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse text-xl font-medium">Loading project portal...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Project not found."}</p>
            <Button onClick={handleBackToAdmin} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-2 h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Project Portal Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "client" | "admin")} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Access
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Admin Access
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-4 mt-4">
                <div>
                  <p className="text-center text-muted-foreground text-sm mb-4">
                    Please enter the password to access the {project.name} portal
                  </p>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter project password"
                    className="w-full"
                    onKeyDown={(e) => e.key === "Enter" && handleClientAuthenticate()}
                  />
                  {error && authMethod === "client" && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBackToAdmin}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleClientAuthenticate}>Access Portal</Button>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <p className="text-center text-muted-foreground text-sm mb-4">
                    Sign in as an administrator to access {project.name} with full permissions
                  </p>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Admin Email"
                    className="w-full"
                  />
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Admin Password"
                    className="w-full"
                    onKeyDown={(e) => e.key === "Enter" && handleAdminAuthenticate()}
                  />
                  {error && authMethod === "admin" && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBackToAdmin}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleAdminAuthenticate} disabled={isAdminLoading}>
                    {isAdminLoading ? "Signing in..." : "Sign In as Admin"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdminMode = !!user;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToAdmin}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
            <h1 className="text-xl font-bold">{project.name} - Client Portal</h1>
            {isAdminMode && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                Admin Mode
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Client: {project.client_name || "No client assigned"}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                    <p className="font-medium">{project.status}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Priority</h3>
                    <p className="font-medium">{project.priority}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Start Date</h3>
                    <p className="font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Due Date</h3>
                    <p className="font-medium">{project.due_date ? new Date(project.due_date).toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full" 
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
                <p className="text-right mt-2 text-sm">{project.progress || 0}% complete</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">The timeline for this project will be displayed here.</p>
                {/* Timeline content would go here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Document sharing and management will be available here.</p>
                {/* Documents content would go here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Payment history and invoices will be displayed here.</p>
                {/* Payments content would go here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectPortal;
