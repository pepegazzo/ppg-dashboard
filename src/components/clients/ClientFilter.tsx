
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
}

interface ClientFilterProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  projects: Project[];
  resetFilters: () => void;
}

export function ClientFilter({
  nameFilter,
  setNameFilter,
  companyFilter,
  setCompanyFilter,
  projectFilter,
  setProjectFilter,
  projects,
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
      <div className="w-[200px]">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="border-amber-200 text-amber-900 hover:bg-amber-50">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent className="border-amber-200">
            <SelectItem value="all">All Projects</SelectItem>
            {projects && projects.length > 0 && (
              <>
                <SelectSeparator className="bg-amber-100" />
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon" onClick={resetFilters} className="shrink-0 border-amber-200 text-amber-800 hover:bg-amber-50">
        ✕
      </Button>
    </div>
  );
}
