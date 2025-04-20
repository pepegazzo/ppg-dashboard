
import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export function BillingFilter({ selectedStatus, onStatusChange }: BillingFilterProps) {
  const statuses = ["paid", "pending", "overdue"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
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
  );
}
