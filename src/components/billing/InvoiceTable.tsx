
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUpDown, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string | null;
  description: string | null;
  project: {
    name: string;
    client_name: string;
  };
}

export function InvoiceTable() {
  const [sortBy, setSortBy] = useState<{ field: keyof Invoice | 'project.name' | 'project.client_name'; direction: 'asc' | 'desc' }>({ 
    field: 'issue_date', 
    direction: 'desc'
  });

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', sortBy],
    queryFn: async () => {
      // Determine which field to sort by, handling nested fields
      let orderField: string;
      
      if (sortBy.field === 'project.name') {
        orderField = 'project.name';
      } else if (sortBy.field === 'project.client_name') {
        orderField = 'project.client_name';
      } else {
        orderField = sortBy.field;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          project:project_id(
            name,
            client_name
          )
        `)
        .order(orderField, { ascending: sortBy.direction === 'asc' });
      
      if (error) throw error;
      return data as Invoice[];
    }
  });

  const toggleSort = (field: keyof Invoice | 'project.name' | 'project.client_name') => {
    setSortBy(prevSort => {
      if (prevSort.field === field) {
        return { field, direction: prevSort.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-md p-4 text-center shadow-sm">
        <p className="text-destructive">Error loading invoices: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-md shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('invoice_number')}>
                Invoice #
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('project.name')}>
                Project
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('project.client_name')}>
                Client
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('amount')}>
                Amount
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('status')}>
                Status
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('issue_date')}>
                Issue Date
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="font-medium text-xs text-muted-foreground">
              <Button variant="ghost" className="p-0 h-8 font-medium text-xs hover:bg-transparent hover:text-foreground" onClick={() => toggleSort('due_date')}>
                Due Date
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell className="text-sm">{invoice.project.name}</TableCell>
                <TableCell className="text-sm">{invoice.project.client_name}</TableCell>
                <TableCell className="text-right font-medium">S/ {invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {invoice.due_date 
                    ? format(new Date(invoice.due_date), 'MMM d, yyyy')
                    : '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground h-[200px]">
                No invoices found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
