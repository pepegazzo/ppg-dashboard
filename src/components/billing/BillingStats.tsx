import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CheckCircle, AlertCircle, BarChart2, Zap } from "lucide-react";

interface BillingStats {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalProjectedRevenue: number;
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

      const result: BillingStats = {
        totalInvoiced: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalProjectedRevenue: 0,
        uninvoicedRevenue: 0
      };

      // Calculate total projected revenue and uninvoiced revenue
      projects?.forEach(project => {
        if (project.revenue) {
          const projectRevenue = Number(project.revenue);
          result.totalProjectedRevenue += projectRevenue;
        }
      });

      // Track invoiced projects and calculate invoice stats
      const invoicedProjectIds = new Set<string>();

      invoices?.forEach(invoice => {
        const amount = Number(invoice.amount);
        
        result.totalInvoiced += amount;
        
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

        if (invoice.project_id) {
          invoicedProjectIds.add(invoice.project_id);
        }
      });

      // Calculate true uninvoiced revenue
      projects?.forEach(project => {
        if (project.revenue && !invoicedProjectIds.has(project.id)) {
          result.uninvoicedRevenue += Number(project.revenue);
        }
      });
      
      return result;
    },
    staleTime: 0
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <StatsCard 
        title="Total Invoiced" 
        value={stats?.totalInvoiced ?? 0} 
        description="Total amount invoiced" 
        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
        className="lg:col-span-2"
      />
      <StatsCard 
        title="Paid" 
        value={stats?.totalPaid ?? 0} 
        description="Amount already paid" 
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        isLoading={isLoading}
        color="text-green-600"
        className="lg:col-span-2"
      />
      <StatsCard 
        title="Overdue" 
        value={stats?.totalOverdue ?? 0} 
        description="Amount overdue" 
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        isLoading={isLoading}
        color="text-red-600"
        className="lg:col-span-2"
      />
      <StatsCard 
        title="Projected Revenue" 
        value={stats?.totalProjectedRevenue ?? 0} 
        description="Total expected project revenue" 
        icon={<BarChart2 className="h-5 w-5 text-blue-500" />}
        isLoading={isLoading}
        color="text-blue-600"
        className="lg:col-span-3"
      />
      <StatsCard 
        title="Uninvoiced Revenue" 
        value={stats?.uninvoicedRevenue ?? 0} 
        description="Projects not yet invoiced" 
        icon={<Zap className="h-5 w-5 text-purple-500" />}
        isLoading={isLoading}
        color="text-purple-600"
        className="lg:col-span-3"
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
