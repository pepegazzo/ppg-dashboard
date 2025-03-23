
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BillingStats } from "@/components/billing/BillingStats";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { CreateInvoiceForm } from "@/components/billing/CreateInvoiceForm";

const Billing = () => {
  const queryClient = useQueryClient();
  
  const handleInvoiceCreated = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
  };
  
  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full w-fit">Finance</span>
            <h1 className="text-3xl font-bold text-zinc-900 mt-2">Billing</h1>
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
