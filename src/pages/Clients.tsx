import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone, PlusCircle, Loader2, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InlineEdit from "@/components/clients/InlineEdit";
import ClientModal from "@/components/clients/ClientModal";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/clients/EmptyState";
import { ClientFilter } from "@/components/clients/ClientFilter";
import ClientProjectField from "@/components/clients/ClientProjectField";

interface Project {
  id: string;
  name: string;
  status?: 'Onboarding' | 'Active' | 'Completed';
}

interface Client {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  active_projects: Project[] | null;
}

const Clients = () => {
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client | 'company' | 'email' | 'active_projects';
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('projects').select('id, name').order('name');
      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }
      setAllProjects(data || []);
    } catch (error) {
      console.error('Unexpected error fetching projects:', error);
    }
  };

  const resetFilters = () => {
    setNameFilter("");
    setCompanyFilter("");
    setProjectFilter("all");
  };

  const handleSort = (key: keyof Client | 'company' | 'email' | 'active_projects') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIndicator = (key: keyof Client | 'company' | 'email' | 'active_projects') => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="ml-1 h-4 w-4 inline" /> : 
        <ChevronDown className="ml-1 h-4 w-4 inline" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 inline opacity-40" />;
  };

  const {
    data: rawClients,
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', nameFilter, companyFilter, projectFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          active_projects:projects(id, name, status)
        `)
        .returns<(Client & { active_projects: Project[] | null; })[]>();

      if (error) throw error;

      return data.map(client => ({
        ...client,
        active_projects: client.active_projects || []
      }));
    }
  });

  const filteredAndSortedClients = useMemo(() => {
    if (!rawClients) return [];

    let filteredData = rawClients.filter(client => {
      const nameMatch = client.name.toLowerCase().includes(nameFilter.toLowerCase());
      const companyMatch = client.company.toLowerCase().includes(companyFilter.toLowerCase());
      const projectMatch = projectFilter === 'all' || 
        client.active_projects?.some(project => project.id === projectFilter);
      
      return nameMatch && companyMatch && projectMatch;
    });

    return filteredData.sort((a, b) => {
      if (sortConfig.key === 'active_projects') {
        const aLength = a.active_projects?.length || 0;
        const bLength = b.active_projects?.length || 0;
        const comparison = aLength - bLength;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      const aValue = String(a[sortConfig.key]);
      const bValue = String(b[sortConfig.key]);
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [rawClients, nameFilter, companyFilter, projectFilter, sortConfig]);

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const {
        error: clientUpdateError
      } = await supabase.from('clients').update(updates).eq('id', clientId);
      if (clientUpdateError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update client information"
        });
        throw clientUpdateError;
      }
      if (updates.name) {
        const {
          error: projectsUpdateError
        } = await supabase.from('projects').update({
          client_name: updates.name
        }).eq('client_id', clientId);
        if (projectsUpdateError) {
          console.error("Error updating associated projects:", projectsUpdateError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Client updated but failed to update associated projects"
          });
        }
      }
      toast({
        title: "Success",
        description: "Client information updated"
      });
      queryClient.invalidateQueries({
        queryKey: ['clients']
      });
      queryClient.invalidateQueries({
        queryKey: ['projects']
      });
    } catch (error) {
      console.error("Error in updateClient:", error);
    }
  };

  const createClient = async (clientData: {
    name: string;
    company: string;
    role: string;
    email: string;
    phone: string;
  }) => {
    try {
      setIsSubmitting(true);
      const {
        data,
        error
      } = await supabase.from('clients').insert(clientData).select();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create client"
        });
        throw error;
      }
      toast({
        title: "Success",
        description: "New client created"
      });
      queryClient.invalidateQueries({
        queryKey: ['clients']
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error in createClient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredAndSortedClients?.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredAndSortedClients?.map(client => client.id) || []);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const deleteSelectedClients = async () => {
    try {
      setIsDeleting(true);
      const {
        error
      } = await supabase.from('clients').delete().in('id', selectedClients);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error deleting clients",
          description: error.message || "Please try again later."
        });
        return;
      }
      toast({
        title: "Success",
        description: `${selectedClients.length} client(s) deleted successfully`
      });
      queryClient.invalidateQueries({
        queryKey: ['clients']
      });
      setSelectedClients([]);
    } catch (error) {
      console.error("Error in deleteSelectedClients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting clients"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({
        queryKey: ['clients']
      });
      toast({
        title: "Refreshed",
        description: "Client information updated"
      });
    } catch (error) {
      toast({
        title: "Error refreshing",
        description: "Could not refresh client data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout>
        <div className="text-red-500">Error loading clients</div>
      </DashboardLayout>;
  }

  return <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">
            Relationships
          </span>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-zinc-900">Clients</h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Client
              </Button>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {filteredAndSortedClients && filteredAndSortedClients.length === 0 ? <EmptyState setIsCreating={() => setIsModalOpen(true)} handleRefreshClients={() => queryClient.invalidateQueries({
        queryKey: ['clients']
      })} testCreateClient={async () => {
        await createClient({
          name: "Test Client",
          company: "Test Company",
          role: "Test Role",
          email: "test@example.com",
          phone: "123-456-7890"
        });
      }} /> : <>
            <ClientFilter nameFilter={nameFilter} setNameFilter={setNameFilter} companyFilter={companyFilter} setCompanyFilter={setCompanyFilter} projectFilter={projectFilter} setProjectFilter={setProjectFilter} projects={allProjects} resetFilters={resetFilters} />
            
            <div className="space-y-4">
              {selectedClients.length > 0 && <div className="p-2 bg-muted rounded-md flex items-center justify-between">
                  <span className="text-sm">
                    {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)} disabled={isDeleting}>
                    {isDeleting ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </> : <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </>}
                  </Button>
                </div>}
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={filteredAndSortedClients?.length > 0 && selectedClients.length === filteredAndSortedClients?.length} 
                          onCheckedChange={handleSelectAll} 
                          aria-label="Select all clients" 
                        />
                      </TableHead>
                      <TableHead 
                        className="w-[220px] cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        Name {renderSortIndicator('name')}
                      </TableHead>
                      <TableHead 
                        className="w-[180px] cursor-pointer"
                        onClick={() => handleSort('company')}
                      >
                        Company & Role {renderSortIndicator('company')}
                      </TableHead>
                      <TableHead 
                        className="w-[120px] cursor-pointer"
                        onClick={() => handleSort('email')}
                      >
                        Contact {renderSortIndicator('email')}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSort('active_projects')} 
                        className="w-[200px] cursor-pointer"
                      >
                        Active Projects {renderSortIndicator('active_projects')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedClients?.map(client => <TableRow key={client.id} className="border-b">
                        <TableCell>
                          <Checkbox checked={selectedClients.includes(client.id)} onCheckedChange={() => toggleClientSelection(client.id)} aria-label={`Select client ${client.name}`} />
                        </TableCell>
                        <TableCell className="font-medium">
                          <InlineEdit value={client.name} onSave={async value => {
                      await updateClient(client.id, {
                        name: value
                      });
                    }} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <InlineEdit value={client.company} onSave={async value => {
                          await updateClient(client.id, {
                            company: value
                          });
                        }} />
                            </div>
                            <InlineEdit value={client.role} onSave={async value => {
                        await updateClient(client.id, {
                          role: value
                        });
                      }} className="text-sm text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <InlineEdit value={client.email} onSave={async value => {
                          await updateClient(client.id, {
                            email: value
                          });
                        }} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <InlineEdit value={client.phone} onSave={async value => {
                          await updateClient(client.id, {
                            phone: value
                          });
                        }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {client.active_projects && client.active_projects.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {client.active_projects.map(project => (
                                  <Link key={project.id} to={`/projects?project=${project.id}`} className="group">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="group-hover:bg-secondary/70">
                                        {project.name}
                                      </Badge>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground flex items-center">
                                No active projects
                                <ClientProjectField 
                                  clientId={client.id} 
                                  clientName={client.name} 
                                  activeProjects={client.active_projects} 
                                />
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>}
        
        <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={createClient} isSubmitting={isSubmitting} />

        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedClients.length > 1 ? 'Clients' : 'Client'}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedClients.length === 1 ? 'this client' : `these ${selectedClients.length} clients`}? 
                This action cannot be undone and all associated data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteSelectedClients} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>;
};

export default Clients;
