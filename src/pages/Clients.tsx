
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone, PlusCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import InlineEdit from "@/components/clients/InlineEdit";
import ClientModal from "@/components/clients/ClientModal";

interface Project {
  id: string;
  name: string;
  status: 'Onboarding' | 'Active' | 'Completed';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          active_projects:projects(id, name, status)
        `)
        .returns<(Client & { active_projects: Project[] | null })[]>();

      if (error) throw error;

      return data.map(client => ({
        ...client,
        active_projects: client.active_projects ? client.active_projects.filter(project => 
          project.status === 'Active' || project.status === 'Onboarding'
        ) : []
      }));
    }
  });

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      // First update the client record
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);

      if (clientUpdateError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update client information"
        });
        throw clientUpdateError;
      }

      // If we're updating the client name, also update any projects associated with this client
      if (updates.name) {
        const { error: projectsUpdateError } = await supabase
          .from('projects')
          .update({ client_name: updates.name })
          .eq('client_id', clientId);

        if (projectsUpdateError) {
          console.error("Error updating associated projects:", projectsUpdateError);
          // We don't throw here to avoid failing the entire operation
          // but we do notify the user
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

      // Invalidate both clients and projects queries to refresh all relevant data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
      
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select();
      
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
      
      // Invalidate the clients query to refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error in createClient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-500">Error loading clients</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">
            Relationships
          </span>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-zinc-900">Clients</h1>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company & Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Active Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <InlineEdit
                        value={client.name}
                        onSave={async (value) => {
                          await updateClient(client.id, { name: value });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <InlineEdit
                            value={client.company}
                            onSave={async (value) => {
                              await updateClient(client.id, { company: value });
                            }}
                          />
                        </div>
                        <InlineEdit
                          value={client.role}
                          onSave={async (value) => {
                            await updateClient(client.id, { role: value });
                          }}
                          className="text-sm text-muted-foreground"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <InlineEdit
                            value={client.email}
                            onSave={async (value) => {
                              await updateClient(client.id, { email: value });
                            }}
                            className="text-amber-600 hover:text-amber-700"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <InlineEdit
                            value={client.phone}
                            onSave={async (value) => {
                              await updateClient(client.id, { phone: value });
                            }}
                            className="text-amber-600 hover:text-amber-700"
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {client.active_projects && client.active_projects.length > 0 ? (
                          client.active_projects.map(project => (
                            <Link 
                              key={project.id} 
                              to={`/projects?project=${project.id}`}
                              className="group"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="group-hover:bg-secondary/70">
                                  {project.name}
                                </Badge>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No active projects</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createClient}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
};

export default Clients;
