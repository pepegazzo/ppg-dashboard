
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUpDown, CheckCircle, Clock, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

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

type SortableField = keyof Invoice | 'project.name' | 'project.client_name';

export function InvoiceTable() {
  const { toast } = useToast();
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<{ field: SortableField; direction: 'asc' | 'desc' }>({ 
    field: 'issue_date', 
    direction: 'desc'
  });

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', sortBy],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          project:project_id(
            name,
            client_name
          )
        `);
      
      // Handle sorting differently based on field type
      if (sortBy.field === 'project.name') {
        // For project fields, we'll sort after fetching
        query = query.order('id'); // Just use a default order in the query
      } else if (sortBy.field === 'project.client_name') {
        // For project fields, we'll sort after fetching
        query = query.order('id'); // Just use a default order in the query
      } else {
        // For direct invoice fields, we can use Supabase's order
        query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let sortedData = [...(data as Invoice[])];
      
      // Handle sorting for nested fields after data is fetched
      if (sortBy.field === 'project.name') {
        sortedData.sort((a, b) => {
          const aValue = a.project?.name || '';
          const bValue = b.project?.name || '';
          return sortBy.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        });
      } else if (sortBy.field === 'project.client_name') {
        sortedData.sort((a, b) => {
          const aValue = a.project?.client_name || '';
          const bValue = b.project?.client_name || '';
          return sortBy.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        });
      }
      
      return sortedData;
    }
  });

  const toggleSort = (field: SortableField) => {
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
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1 w-fit"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 w-fit"><AlertCircle className="h-3 w-3" /> Overdue</Badge>;
      default:
        return <Badge variant="outline" className="w-fit">{status}</Badge>;
    }
  };

  const renderSortIndicator = (field: SortableField) => {
    if (sortBy.field === field) {
      return sortBy.direction === 'asc' ? 
        <ChevronUp className="ml-1 h-4 w-4 inline" /> : 
        <ChevronDown className="ml-1 h-4 w-4 inline" />;
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 inline opacity-40" />;
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      setUpdatingInvoiceId(invoiceId);
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId)
        .select();

      if (error) {
        toast({
          title: "Error updating status",
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Status updated",
        description: `Invoice status changed to ${newStatus}`
      });
    } catch (err) {
      console.error('Error updating invoice status:', err);
      toast({
        title: "Error updating status",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setUpdatingInvoiceId(null);
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead onClick={() => toggleSort('invoice_number')} className="cursor-pointer">
              Invoice # {renderSortIndicator('invoice_number')}
            </TableHead>
            <TableHead onClick={() => toggleSort('project.name')} className="cursor-pointer">
              Project {renderSortIndicator('project.name')}
            </TableHead>
            <TableHead onClick={() => toggleSort('project.client_name')} className="cursor-pointer">
              Client {renderSortIndicator('project.client_name')}
            </TableHead>
            <TableHead onClick={() => toggleSort('amount')} className="cursor-pointer text-right">
              Amount {renderSortIndicator('amount')}
            </TableHead>
            <TableHead onClick={() => toggleSort('status')} className="cursor-pointer">
              Payment Status {renderSortIndicator('status')}
            </TableHead>
            <TableHead onClick={() => toggleSort('issue_date')} className="cursor-pointer">
              Issue Date {renderSortIndicator('issue_date')}
            </TableHead>
            <TableHead onClick={() => toggleSort('due_date')} className="cursor-pointer">
              Due Date {renderSortIndicator('due_date')}
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
                <TableCell className="text-right font-medium">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                    S/ {invoice.amount.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                        {updatingInvoiceId === invoice.id ? (
                          <span className="flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Updating...
                          </span>
                        ) : (
                          getStatusBadge(invoice.status)
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`justify-start ${invoice.status === 'pending' ? 'bg-yellow-50' : ''}`}
                          onClick={() => updateInvoiceStatus(invoice.id, 'pending')}
                          disabled={updatingInvoiceId === invoice.id}
                        >
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`justify-start ${invoice.status === 'paid' ? 'bg-green-50' : ''}`}
                          onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                          disabled={updatingInvoiceId === invoice.id}
                        >
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </Badge>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`justify-start ${invoice.status === 'overdue' ? 'bg-red-50' : ''}`}
                          onClick={() => updateInvoiceStatus(invoice.id, 'overdue')}
                          disabled={updatingInvoiceId === invoice.id}
                        >
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Overdue
                          </Badge>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
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
