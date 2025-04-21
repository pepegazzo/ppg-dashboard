import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown, Plus, Mail, Phone, Briefcase, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ClientContactsModal from "./ClientContactsModal";
import { Project, Client, Contact } from "@/types/clients";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProjectSelect } from "./ProjectSelect";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import ClientCompanyCell from "./ClientCompanyCell";

interface ClientsTableProps {
  filteredAndSortedClients: Client[];
  selectedClients: string[];
  toggleClientSelection: (clientId: string) => void;
  handleSelectAll: () => void;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
  handleSort: (key: keyof Client | 'company' | 'email' | 'active_projects') => void;
  sortConfig: {
    key: keyof Client | 'company' | 'email' | 'active_projects';
    direction: 'asc' | 'desc';
  };
}

const renderSortIndicator = (key: keyof Client | 'company' | 'email' | 'active_projects', sortConfig: ClientsTableProps['sortConfig']) => {
  if (sortConfig.key === key) {
    return sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4 inline" /> : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  }
  return <ArrowUpDown className="ml-1 h-4 w-4 inline opacity-40" />;
};

export const ClientsTable = ({
  filteredAndSortedClients,
  selectedClients,
  toggleClientSelection,
  handleSelectAll,
  updateClient,
  handleSort,
  sortConfig
}: ClientsTableProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [openModalClientId, setOpenModalClientId] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  
  const handleRowClick = (clientId: string) => {
    setOpenAccordionId(prev => prev === clientId ? null : clientId);
  };
  
  const handleProjectUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: ['clients']
    });
  };

  const removeProjectFromClient = async (clientId: string, projectId: string, projectName: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('client_project_assignments')
        .delete()
        .eq('client_id', clientId)
        .eq('project_id', projectId);
      
      if (deleteError) throw deleteError;
      
      const { data: projectData } = await supabase
        .from('projects')
        .select('client_id, client_name')
        .eq('id', projectId)
        .single();
        
      if (projectData?.client_id === clientId) {
        const { data: nextClient } = await supabase
          .from('client_project_assignments')
          .select(`
            clients (
              id,
              company_name
            )
          `)
          .eq('project_id', projectId)
          .neq('client_id', clientId)
          .limit(1)
          .single();
          
        if (nextClient) {
          await supabase
            .from('projects')
            .update({ 
              client_id: nextClient.clients.id,
              client_name: nextClient.clients.company_name
            })
            .eq('id', projectId);
        } else {
          await supabase
            .from('projects')
            .update({ 
              client_id: null,
              client_name: "No Client"
            })
            .eq('id', projectId);
        }
      }
      
      toast({
        title: "Project removed",
        description: `${projectName} is no longer assigned to this client`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['client-assigned-projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-available-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      console.error("Error removing project from client:", error);
      toast({
        title: "Error",
        description: "Failed to remove project from client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px] align-middle">
              <div className="flex items-center h-10">
                <Checkbox 
                  checked={filteredAndSortedClients?.length > 0 && selectedClients.length === filteredAndSortedClients?.length} 
                  onCheckedChange={handleSelectAll} 
                  aria-label="Select all clients" 
                />
              </div>
            </TableHead>
            <TableHead className="w-[220px] cursor-pointer align-middle" onClick={() => handleSort('company_name')}>
              <div className="flex items-center h-10">
                Company / Brand {renderSortIndicator('company_name', sortConfig)}
              </div>
            </TableHead>
            <TableHead className="align-middle">
              <div className="flex items-center h-10">
                Active Projects
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedClients?.map(client => (
            <React.Fragment key={client.id}>
              <TableRow className={`border-b cursor-pointer group ${openAccordionId === client.id ? 'bg-muted/20' : ''}`} onClick={() => handleRowClick(client.id)}>
                <TableCell className="align-middle">
                  <div className="flex items-center h-10">
                    <Checkbox 
                      checked={selectedClients.includes(client.id)} 
                      onCheckedChange={() => toggleClientSelection(client.id)} 
                      aria-label={`Select client ${client.company_name}`} 
                    />
                  </div>
                </TableCell>
                <TableCell className="align-middle p-4">
                  <ClientCompanyCell name={client.company_name} isOpen={openAccordionId === client.id} />
                </TableCell>
                <TableCell className="align-middle">
                  <div className="flex flex-wrap gap-2 items-center min-h-10">
                    {client.active_projects?.filter(p => p.status !== "Completed" && p.status !== "Cancelled").map((project: any) => (
                      <Badge
                        key={project.id}
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {project.name}
                        <button
                          type="button"
                          className="ml-1 p-0.5 rounded-full hover:bg-muted transition-colors"
                          aria-label={`Remove ${project.name}`}
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation();
                            removeProjectFromClient(client.id, project.id, project.name);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <ProjectSelect clientId={client.id} onUpdate={handleProjectUpdate} />
                  </div>
                </TableCell>
              </TableRow>
              {openAccordionId === client.id && (
                <TableRow>
                  <TableCell />
                  <TableCell colSpan={2}>
                    <div className="py-3">
                      <div className="font-semibold mb-2 text-foreground">Contacts</div>
                      {client.contacts && client.contacts.length > 0 ? (
                        <div className="space-y-2">
                          {client.contacts.map((contact: Contact) => (
                            <div key={contact.id} className="p-4 border rounded-md bg-muted/10">
                              <span className="font-medium text-foreground">{contact.name}</span>
                              <div className="grid grid-cols-3 gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {contact.role || "—"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {contact.email ? (
                                      <a href={`mailto:${contact.email}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                        {contact.email}
                                      </a>
                                    ) : (
                                      "—"
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {contact.phone || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm border rounded-md p-4 bg-muted/5">
                          No contacts added yet for this company
                        </div>
                      )}
                      <Button 
                        onClick={e => {
                          e.stopPropagation();
                          setOpenModalClientId(client.id);
                        }} 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Manage Contacts
                      </Button>
                      {openModalClientId === client.id && (
                        <ClientContactsModal 
                          clientId={client.id} 
                          currentContacts={client.contacts || []} 
                          onClose={() => setOpenModalClientId(null)} 
                          onChanged={() => {
                            setOpenModalClientId(null);
                            queryClient.invalidateQueries({
                              queryKey: ['clients']
                            });
                          }} 
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
