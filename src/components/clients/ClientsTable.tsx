import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone, Loader2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import InlineEdit from "./InlineEdit";
import { ProjectSelect } from "./ProjectSelect";
import { Project, Client, Contact } from "@/types/clients";
import { useQueryClient } from "@tanstack/react-query";

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
            <TableHead 
              className="w-[180px] cursor-pointer"
              onClick={() => handleSort('company')}
            >
              Legal Entity {renderSortIndicator('company', sortConfig)}
            </TableHead>
            <TableHead 
              className="w-[160px] cursor-pointer"
            >
              Primary Contact
            </TableHead>
            <TableHead>
              Website
            </TableHead>
            <TableHead>
              Address
            </TableHead>
            <TableHead>
              Notes
            </TableHead>
            <TableHead 
              onClick={() => handleSort('active_projects')} 
              className="w-[200px] cursor-pointer"
            >
              Projects {renderSortIndicator('active_projects', sortConfig)}
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
              <TableCell>{client.company}</TableCell>
              {/* Primary Contact */}
              <TableCell>
                {client.contacts?.length > 0
                  ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{client.contacts.find(c => c.is_primary)?.name ?? client.contacts[0].name}</span>
                      <span className="text-muted-foreground text-xs">
                        {client.contacts.find(c => c.is_primary)?.role || client.contacts[0].role}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {client.contacts.find(c => c.is_primary)?.email || client.contacts[0].email}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {client.contacts.find(c => c.is_primary)?.phone || client.contacts[0].phone}
                      </span>
                      {client.contacts.length > 1 && (
                        <span className="text-xs text-amber-700 mt-1">
                          +{client.contacts.length - 1} other contact(s)
                        </span>
                      )}
                    </div>
                  )
                  : <span className="text-muted-foreground text-xs">No contacts</span>}
              </TableCell>
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
              <TableCell>
                <span className="text-xs">{client.address}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{client.notes}</span>
              </TableCell>
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
