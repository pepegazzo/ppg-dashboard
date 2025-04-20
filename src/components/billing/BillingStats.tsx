import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface BillingStats {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export function BillingStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('amount, status');
      
      if (invoicesError) throw invoicesError;

      const result: BillingStats = {
        totalInvoiced: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0
      };

      // Calculate invoice stats
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
      });
      
      return result;
    },
    staleTime: 0
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Invoiced" 
        value={stats?.totalInvoiced ?? 0} 
        description="Total amount invoiced" 
        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <StatsCard 
        title="Paid" 
        value={stats?.totalPaid ?? 0} 
        description="Amount already paid" 
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        isLoading={isLoading}
        color="text-green-600"
      />
      <StatsCard 
        title="Pending" 
        value={stats?.totalPending ?? 0} 
        description="Amount pending payment" 
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        isLoading={isLoading}
        color="text-amber-600"
      />
      <StatsCard 
        title="Overdue" 
        value={stats?.totalOverdue ?? 0} 
        description="Amount overdue" 
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        isLoading={isLoading}
        color="text-red-600"
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
