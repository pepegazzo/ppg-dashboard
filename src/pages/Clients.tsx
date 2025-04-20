
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Phone } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  active_projects: number;
}

const Clients = () => {
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // Temporarily return mock data until we set up the clients table
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'John Doe',
          company: 'Tech Corp',
          role: 'CTO',
          email: 'john@techcorp.com',
          phone: '+1 234 567 890',
          active_projects: 3
        },
        {
          id: '2',
          name: 'Jane Smith',
          company: 'Design Studio',
          role: 'Creative Director',
          email: 'jane@designstudio.com',
          phone: '+1 234 567 891',
          active_projects: 2
        }
      ];
      return mockClients;
    }
  });

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
            <Button>Add Client</Button>
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
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{client.company}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{client.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${client.email}`} className="text-amber-600 hover:text-amber-700">
                            {client.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${client.phone}`} className="text-amber-600 hover:text-amber-700">
                            {client.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {client.active_projects} active project{client.active_projects !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
