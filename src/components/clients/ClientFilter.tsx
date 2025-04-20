
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
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Filter by client name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
          />
        </div>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Filter by company..."
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="border-purple-200 focus-visible:ring-purple-500"
        />
      </div>
      <div className="w-[200px]">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="border-purple-200 text-purple-900 hover:bg-purple-50 focus:ring-purple-500">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent className="border-purple-200">
            <SelectItem value="all">All Projects</SelectItem>
            {projects && projects.length > 0 && (
              <>
                <SelectSeparator className="bg-purple-100" />
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
      <Button 
        variant="outline" 
        size="icon" 
        onClick={resetFilters} 
        className="shrink-0 border-purple-200 text-purple-800 hover:bg-purple-50"
      >
        ✕
      </Button>
    </div>
  );
}
