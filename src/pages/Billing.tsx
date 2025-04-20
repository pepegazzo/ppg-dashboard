
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BillingStats } from "@/components/billing/BillingStats";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { CreateInvoiceForm } from "@/components/billing/CreateInvoiceForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get project filter from URL
  const projectFromUrl = searchParams.get('project');
  
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
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">Finance</span>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-zinc-900">Billing</h1>
            <div className="flex gap-2">
              <CreateInvoiceForm onSuccess={handleInvoiceCreated} />
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <BillingStats />
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Invoices</h2>
            <InvoiceTable initialProjectFilter={projectFromUrl || ""} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
