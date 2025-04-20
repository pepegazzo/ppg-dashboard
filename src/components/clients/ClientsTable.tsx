
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

  return <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px]">
              <Checkbox checked={filteredAndSortedClients?.length > 0 && selectedClients.length === filteredAndSortedClients?.length} onCheckedChange={handleSelectAll} aria-label="Select all clients" />
            </TableHead>
            <TableHead className="w-[220px] cursor-pointer" onClick={() => handleSort('company_name')}>
              Company / Brand {renderSortIndicator('company_name', sortConfig)}
            </TableHead>
            <TableHead>
              Active Projects
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedClients?.map(client => (
            <React.Fragment key={client.id}>
              <TableRow className={`border-b cursor-pointer group ${openAccordionId === client.id ? 'bg-muted/20' : ''}`} onClick={() => handleRowClick(client.id)}>
                <TableCell>
                  <Checkbox checked={selectedClients.includes(client.id)} onCheckedChange={() => toggleClientSelection(client.id)} aria-label={`Select client ${client.company_name}`} />
                </TableCell>
                <TableCell className="font-medium flex items-center gap-">
                  {client.company_name}
                  <span className="ml-2 text-muted-foreground">
                    {openAccordionId === client.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2 items-center">
                    {client.active_projects?.filter(p => p.status !== "Completed" && p.status !== "Cancelled").map((project: any) => (
                      <Badge
                        key={project.id}
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border-amber-200"
                      >
                        {project.name}
                        <button
                          type="button"
                          className="ml-1 p-0.5 rounded-full hover:bg-amber-100 transition-colors"
                          aria-label={`Remove ${project.name}`}
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation();
                            removeProjectFromClient(client.id, project.id, project.name);
                          }}
                        >
                          <X className="w-3 h-3 text-amber-500" />
                        </button>
                      </Badge>
                    ))}
                    {client.active_projects?.filter(p => p.status !== "Completed" && p.status !== "Cancelled").length === 0 && 
                      <span className="text-xs text-muted-foreground">No active projects</span>
                    }
                    <ProjectSelect clientId={client.id} onUpdate={handleProjectUpdate} />
                  </div>
                </TableCell>
              </TableRow>
              {openAccordionId === client.id && <TableRow className="bg-muted/10">
                  <TableCell />
                  <TableCell colSpan={2}>
                    <div className="py-3">
                      <div className="font-semibold mb-1">Contacts</div>
                      {client.contacts && client.contacts.length > 0 ? <div className="divide-y divide-muted-foreground/10 rounded border border-muted/30 bg-amber-50/30">
                          {client.contacts.map((contact: Contact) => <div key={contact.id} className="p-3 flex flex-col gap-2">
                              <span className="font-medium">{contact.name}</span>
                              <div className="grid grid-cols-3 gap-3 mt-1 text-zinc-700 text-[13px]">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span>
                                    <Briefcase className="h-4 w-4 text-amber-700" />
                                  </span>
                                  <span className="truncate">{contact.role || <span className="text-muted-foreground">—</span>}</span>
                                </div>
                                <div className="flex items-center gap-1 min-w-0">
                                  <span>
                                    <Mail className="h-4 w-4 text-amber-700" />
                                  </span>
                                  {contact.email ? <span className="underline truncate">{contact.email}</span> : <span className="text-muted-foreground">—</span>}
                                </div>
                                <div className="flex items-center gap-1 min-w-0">
                                  <span>
                                    <Phone className="h-4 w-4 text-amber-700" />
                                  </span>
                                  <span className="truncate">{contact.phone || <span className="text-muted-foreground">—</span>}</span>
                                </div>
                              </div>
                            </div>)}
                        </div> : <span className="text-muted-foreground text-xs">No contacts</span>}
                      <Button 
                        onClick={e => {
                          e.stopPropagation();
                          setOpenModalClientId(client.id);
                        }} 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs text-amber-800 hover:bg-amber-50 border-amber-200"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Manage Contacts
                      </Button>
                      {openModalClientId === client.id && <ClientContactsModal clientId={client.id} currentContacts={client.contacts || []} onClose={() => setOpenModalClientId(null)} onChanged={() => {
                        setOpenModalClientId(null);
                        queryClient.invalidateQueries({
                          queryKey: ['clients']
                        });
                      }} />}
                    </div>
                  </TableCell>
                </TableRow>}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>;
};
