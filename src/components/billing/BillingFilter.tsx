
import { Check, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BillingFilterProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function BillingFilter({ 
  selectedStatus, 
  onStatusChange,
  searchQuery,
  onSearchChange,
}: BillingFilterProps) {
  const statuses = ["paid", "pending", "overdue"];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            {selectedStatus ? (
              <>
                Status: <span className="ml-1 capitalize">{selectedStatus}</span>
              </>
            ) : (
              "Filter"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => onStatusChange(null)}>
            <Check className={`mr-2 h-4 w-4 ${!selectedStatus ? 'opacity-100' : 'opacity-0'}`} />
            All Statuses
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {statuses.map((status) => (
            <DropdownMenuItem key={status} onClick={() => onStatusChange(status)}>
              <Check
                className={`mr-2 h-4 w-4 ${
                  selectedStatus === status ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="capitalize">{status}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
