
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Clock, CheckCircle, AlertCircle, BarChart2, Zap } from "lucide-react";

interface BillingStats {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalProjectRevenue: number;
  uninvoicedRevenue: number;
}

export function BillingStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      // Get all invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('amount, status, project_id');
      
      if (invoicesError) throw invoicesError;

      // Get all projects with revenue
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, revenue');
      
      if (projectsError) throw projectsError;

      // Calculate stats
      const result: BillingStats = {
        totalInvoiced: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalProjectRevenue: 0,
        uninvoicedRevenue: 0
      };

      // Calculate total project revenue
      projects?.forEach(project => {
        if (project.revenue) {
          result.totalProjectRevenue += Number(project.revenue);
        }
      });

      // Track projects that have invoices
      const invoicedProjectIds = new Set<string>();

      // Calculate invoice stats
      invoices?.forEach(invoice => {
        const amount = Number(invoice.amount);
        
        // Add to total invoiced
        result.totalInvoiced += amount;
        
        // Add to respective status total
        switch (invoice.status.toLowerCase()) {
          case 'paid':
            result.totalPaid += amount;
            break;
          case 'pending':
            result.totalPending += amount;
            break;
          case 'overdue':
            result.totalOverdue += amount;
            break;
        }

        // Track which projects have invoices
        if (invoice.project_id) {
          invoicedProjectIds.add(invoice.project_id);
        }
      });

      // Calculate uninvoiced revenue
      projects?.forEach(project => {
        if (project.revenue && !invoicedProjectIds.has(project.id)) {
          result.uninvoicedRevenue += Number(project.revenue);
        }
      });
      
      return result;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <StatsCard 
        title="Total Invoiced" 
        value={stats?.totalInvoiced ?? 0} 
        description="Total amount invoiced" 
        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
        className="lg:col-span-1"
      />
      <StatsCard 
        title="Paid" 
        value={stats?.totalPaid ?? 0} 
        description="Amount already paid" 
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        isLoading={isLoading}
        color="text-green-600"
        className="lg:col-span-1"
      />
      <StatsCard 
        title="Pending" 
        value={stats?.totalPending ?? 0} 
        description="Amount pending payment" 
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        isLoading={isLoading}
        color="text-amber-600"
        className="lg:col-span-1"
      />
      <StatsCard 
        title="Overdue" 
        value={stats?.totalOverdue ?? 0} 
        description="Amount overdue" 
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        isLoading={isLoading}
        color="text-red-600"
        className="lg:col-span-1"
      />
      <StatsCard 
        title="Total Project Revenue" 
        value={stats?.totalProjectRevenue ?? 0} 
        description="Sum of all project revenues" 
        icon={<BarChart2 className="h-5 w-5 text-blue-500" />}
        isLoading={isLoading}
        color="text-blue-600"
        className="lg:col-span-1"
      />
      <StatsCard 
        title="Uninvoiced Revenue" 
        value={stats?.uninvoicedRevenue ?? 0} 
        description="Revenue not yet invoiced" 
        icon={<Zap className="h-5 w-5 text-purple-500" />}
        isLoading={isLoading}
        color="text-purple-600"
        className="lg:col-span-1"
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  color?: string;
  className?: string;
}

function StatsCard({ title, value, description, icon, isLoading, color, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-3/4" />
        ) : (
          <div className={`text-2xl font-bold ${color || ''}`}>
            S/ {value.toFixed(2)}
          </div>
        )}
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
