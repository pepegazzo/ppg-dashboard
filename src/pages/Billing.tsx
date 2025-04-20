
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BillingStats } from "@/components/billing/BillingStats";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { CreateInvoiceForm } from "@/components/billing/CreateInvoiceForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleInvoiceCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
  };
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      
      toast({
        title: "Refreshed",
        description: "Billing information updated"
      });
    } catch (error) {
      toast({
        title: "Error refreshing",
        description: "Could not refresh billing data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">Finance</span>
              <h1 className="text-3xl font-bold text-zinc-900 mt-2">Billing</h1>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CreateInvoiceForm onSuccess={handleInvoiceCreated} />
        </div>
        
        <div className="space-y-8">
          <BillingStats />
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Invoices</h2>
            <InvoiceTable />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;

