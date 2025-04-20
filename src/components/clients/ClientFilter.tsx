
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

interface ClientFilterProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  resetFilters: () => void;
}

export function ClientFilter({
  nameFilter,
  setNameFilter,
  companyFilter,
  setCompanyFilter,
  roleFilter,
  setRoleFilter,
  resetFilters,
}: ClientFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by client name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Filter by company..."
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
      </div>
      <div className="w-[180px]">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="CEO">CEO</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
            <SelectItem value="Developer">Developer</SelectItem>
            <SelectItem value="Designer">Designer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" onClick={resetFilters} className="shrink-0">
        ✕
      </Button>
    </div>
  );
}
