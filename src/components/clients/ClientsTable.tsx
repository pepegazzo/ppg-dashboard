import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// No Badge
import { ChevronDown, ChevronUp, ArrowUpDown, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ClientContactsModal from "./ClientContactsModal";
import { Project, Client, Contact } from "@/types/clients";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectSelect } from "./ProjectSelect";

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
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-1 h-4 w-4 inline" />
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
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
  sortConfig,
}: ClientsTableProps) => {
  const queryClient = useQueryClient();
  const [openModalClientId, setOpenModalClientId] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  const handleRowClick = (clientId: string) => {
    setOpenAccordionId((prev) => prev === clientId ? null : clientId);
  };

  const handleProjectUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  return (
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
              onClick={() => handleSort('company_name')}
            >
              Company / Brand {renderSortIndicator('company_name', sortConfig)}
            </TableHead>
            {/* REMOVE Website col */}
            <TableHead>
              Projects
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedClients?.map(client => (
            <React.Fragment key={client.id}>
              <TableRow
                className={`border-b cursor-pointer group ${openAccordionId === client.id ? 'bg-muted/20' : ''}`}
                onClick={() => handleRowClick(client.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => toggleClientSelection(client.id)}
                    aria-label={`Select client ${client.company_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  {client.company_name}
                  <span className="ml-2 text-muted-foreground">
                    {openAccordionId === client.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </TableCell>
                {/* Remove website col */}
                <TableCell>
                  {/* Projects column stays here */}
                  {/* Assume you have a ProjectSelect component still as before, if not, remove */}
                  {client.active_projects?.length > 0
                    ? client.active_projects.map((p: any) => (
                        <div key={p.id} className="inline-block px-2 py-1 bg-accent rounded text-xs mr-1 mb-1">{p.name}</div>
                      ))
                    : <span className="text-xs text-muted-foreground">No projects</span>
                  }
                </TableCell>
              </TableRow>
              {openAccordionId === client.id && (
                <TableRow className="bg-muted/10">
                  <TableCell />
                  <TableCell colSpan={2}>
                    <div className="py-3">
                      <div className="font-semibold mb-1">Contacts</div>
                      {client.contacts && client.contacts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {client.contacts.map((contact: any) => (
                            <div key={contact.id} className="bg-muted/30 rounded px-3 py-2 flex flex-col gap-0.5">
                              <span className="font-medium">{contact.name}</span>
                              {contact.role && <span className="text-xs">{contact.role}</span>}
                              {contact.email && <span className="text-xs text-muted-foreground">{contact.email}</span>}
                              {contact.phone && <span className="text-xs text-muted-foreground">{contact.phone}</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No contacts</span>
                      )}
                      {/* Add contact/manage button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenModalClientId(client.id); }}
                        type="button"
                        className="inline-flex items-center mt-3 text-xs text-blue-600 hover:underline gap-1"
                      >
                        <Plus className="h-3 w-3" /> Manage Contacts
                      </button>
                      {openModalClientId === client.id && (
                        <ClientContactsModal
                          clientId={client.id}
                          currentContacts={client.contacts || []}
                          onClose={() => setOpenModalClientId(null)}
                          onChanged={() => {
                            setOpenModalClientId(null);
                            queryClient.invalidateQueries({ queryKey: ['clients'] });
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
