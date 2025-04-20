
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillingFilterProps {
  invoiceFilter: string;
  setInvoiceFilter: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  clientFilter: string;
  setClientFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  resetFilters: () => void;
}

export function BillingFilter({
  invoiceFilter,
  setInvoiceFilter,
  projectFilter,
  setProjectFilter,
  clientFilter,
  setClientFilter,
  statusFilter,
  setStatusFilter,
  resetFilters,
}: BillingFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by invoice number..."
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Filter by project name..."
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Input
          placeholder="Filter by client name..."
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        />
      </div>
      <div className="w-[180px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" onClick={resetFilters} className="shrink-0">
        ✕
      </Button>
    </div>
  );
}
