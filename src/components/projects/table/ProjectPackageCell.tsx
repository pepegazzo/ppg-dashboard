
import { useState, useEffect } from "react";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getServiceIcon } from "../form/ProjectPackageField";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface PackageType {
  id: string;
  name: string;
  description: string | null;
}

interface ProjectPackageCellProps {
  packageName?: string | null;
  projectId: string;
}

export function ProjectPackageCell({ packageName, projectId }: ProjectPackageCellProps) {
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(packageName);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPackages();
    }
  }, [open]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('package_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProjectPackage = async (packageId: string) => {
    try {
      setUpdating(true);
      
      // First, get the selected package name for display
      const selectedPkg = packages.find(p => p.id === packageId);
      
      // Delete any existing project_packages for this project
      await supabase
        .from('project_packages')
        .delete()
        .eq('project_id', projectId);
      
      // Insert the new project_package relationship
      const { error } = await supabase
        .from('project_packages')
        .insert({
          project_id: projectId,
          package_id: packageId
        });
      
      if (error) throw error;
      
      setSelectedPackage(selectedPkg?.name || null);
      toast({
        title: "Service updated",
        description: `Project service set to ${selectedPkg?.name || 'unknown'}`
      });
    } catch (error: any) {
      console.error('Error updating project package:', error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  };

  return (
    <TableCell>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {selectedPackage ? (
            <Badge 
              variant="outline" 
              className="inline-flex items-center gap-1 text-xs w-fit cursor-pointer hover:bg-accent"
            >
              <Package className="h-3 w-3 shrink-0" />
              <span className="truncate">{selectedPackage}</span>
            </Badge>
          ) : (
            <span 
              className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors"
            >
              Set service
            </span>
          )}
        </PopoverTrigger>
        
        <PopoverContent className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Search services..." className="h-9" />
            <CommandList>
              <CommandEmpty>No services found.</CommandEmpty>
              <CommandGroup>
                {loading ? (
                  <div className="p-3 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <span className="text-sm text-muted-foreground">Loading services...</span>
                  </div>
                ) : (
                  packages.map((pkg) => (
                    <CommandItem
                      key={pkg.id}
                      value={pkg.name}
                      onSelect={() => updateProjectPackage(pkg.id)}
                      className="flex items-center gap-2 py-2"
                      disabled={updating}
                    >
                      {getServiceIcon(pkg.name)}
                      <div className="flex flex-col items-start">
                        <span>{pkg.name}</span>
                        {pkg.description && (
                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                        )}
                      </div>
                      {selectedPackage === pkg.name && (
                        <Check className="ml-auto h-4 w-4 opacity-70" />
                      )}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}
