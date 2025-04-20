
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone, Loader2, ChevronUp, ChevronDown, ArrowUpDown, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import InlineEdit from "./InlineEdit";
import { ProjectSelect } from "./ProjectSelect";
import { Project, Client, Contact } from "@/types/clients";
import { useQueryClient } from "@tanstack/react-query";
import ClientContactsModal from "./ClientContactsModal"; // New

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
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="ml-1 h-4 w-4 inline" /> :
      <ChevronDown className="ml-1 h-4 w-4 inline" />;
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
            {/* REMOVE "Legal Entity"/company col */}
            <TableHead className="w-[200px]">Contacts</TableHead>
            <TableHead>
              Website
            </TableHead>
            <TableHead>
              Projects
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedClients?.map(client => (
            <TableRow key={client.id} className="border-b">
              <TableCell>
                <Checkbox
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => toggleClientSelection(client.id)}
                  aria-label={`Select client ${client.company_name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{client.company_name}</TableCell>
              {/* Contacts column */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  {/* List all contacts */}
                  {client.contacts && client.contacts.length > 0 ? (
                    client.contacts.map(contact => (
                      <div key={contact.id} className="flex flex-col text-xs mb-1 bg-muted/30 px-2 py-1 rounded">
                        <span className="font-semibold">{contact.name}</span>
                        {contact.role && <span className="text-muted-foreground">{contact.role}</span>}
                        {contact.email && <span className="text-muted-foreground">{contact.email}</span>}
                        {contact.phone && <span className="text-muted-foreground">{contact.phone}</span>}
                        {contact.is_primary && (
                          <Badge className="mt-1 w-fit" variant="secondary">Primary</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">No contacts</span>
                  )}
                  {/* Add contact button */}
                  <button
                    onClick={() => setOpenModalClientId(client.id)}
                    type="button"
                    className="inline-flex items-center mt-1 text-xs text-blue-600 hover:underline gap-1"
                  >
                    <Plus className="h-3 w-3" /> Manage Contacts
                  </button>
                </div>
                {/* Modal for managing contacts */}
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
              </TableCell>
              {/* Website column */}
              <TableCell>
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-700"
                  >
                    {client.website}
                  </a>
                )}
              </TableCell>
              {/* Projects column */}
              <TableCell>
                <ProjectSelect
                  clientId={client.id}
                  onUpdate={handleProjectUpdate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
