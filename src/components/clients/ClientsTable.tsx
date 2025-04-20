
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone, Loader2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import InlineEdit from "./InlineEdit";
import ClientProjectField from "./ClientProjectField";
import { Project, Client } from "@/types/clients";

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
              onClick={() => handleSort('name')}
            >
              Name {renderSortIndicator('name', sortConfig)}
            </TableHead>
            <TableHead 
              className="w-[180px] cursor-pointer"
              onClick={() => handleSort('company')}
            >
              Company & Role {renderSortIndicator('company', sortConfig)}
            </TableHead>
            <TableHead 
              className="w-[120px] cursor-pointer"
              onClick={() => handleSort('email')}
            >
              Contact {renderSortIndicator('email', sortConfig)}
            </TableHead>
            <TableHead 
              onClick={() => handleSort('active_projects')} 
              className="w-[200px] cursor-pointer"
            >
              Active Projects {renderSortIndicator('active_projects', sortConfig)}
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
                  aria-label={`Select client ${client.name}`} 
                />
              </TableCell>
              <TableCell className="font-medium">
                <InlineEdit 
                  value={client.name} 
                  onSave={async value => {
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
                      onSave={async value => {
                        await updateClient(client.id, { company: value });
                      }} 
                    />
                  </div>
                  <InlineEdit 
                    value={client.role} 
                    onSave={async value => {
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
                      onSave={async value => {
                        await updateClient(client.id, { email: value });
                      }} 
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <InlineEdit 
                      value={client.phone} 
                      onSave={async value => {
                        await updateClient(client.id, { phone: value });
                      }} 
                    />
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
