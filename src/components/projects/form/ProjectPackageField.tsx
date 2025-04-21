
import { useState, useEffect } from "react";
import { Control, useController } from "react-hook-form";
import { Wrench, Palette, Video, Globe, Heart, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormValues } from "./types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface ProjectPackageFieldProps {
  control: Control<ProjectFormValues>;
  existingPackageId?: string;
}

export const getServiceIcon = (packageName: string) => {
  switch(packageName.toLowerCase()) {
    case 'branding':
      return <Heart className="h-4 w-4 mr-2 opacity-70" />;
    case 'custom':
      return <Wrench className="h-4 w-4 mr-2 opacity-70" />;
    case 'design':
      return <Palette className="h-4 w-4 mr-2 opacity-70" />;
    case 'video':
      return <Video className="h-4 w-4 mr-2 opacity-70" />;
    case 'website':
      return <Globe className="h-4 w-4 mr-2 opacity-70" />;
    default:
      return <Package className="h-4 w-4 mr-2 opacity-70" />;
  }
};

export function ProjectPackageField({ control, existingPackageId }: ProjectPackageFieldProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  const { field } = useController({
    name: "package",
    control,
    defaultValue: existingPackageId || "",
  });

  useEffect(() => {
    async function fetchPackages() {
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
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPackages();
  }, []);

  const selectPackage = (packageId: string) => {
    field.onChange(packageId);
    setOpen(false);
  };

  const getSelectedPackageName = () => {
    if (!field.value) return "";
    const pkg = packages.find(p => p.id === field.value);
    return pkg ? pkg.name : "";
  };

  return (
    <div className="space-y-2">
      <Label>Service</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start h-auto min-h-10 py-2"
            role="combobox"
            aria-expanded={open}
          >
            {field.value ? (
              getServiceIcon(getSelectedPackageName())
            ) : (
              <Package className="h-4 w-4 mr-2 opacity-70" />
            )}
            <span className="font-normal">
              {field.value 
                ? getSelectedPackageName()
                : "Select service..."
              }
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search services..." />
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {loading ? (
                <div className="p-2 text-sm text-muted-foreground">Loading services...</div>
              ) : error ? (
                <div className="p-2 text-sm text-red-500">Error: {error}</div>
              ) : packages.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No services available</div>
              ) : (
                <CommandList className="max-h-[300px] overflow-auto">
                  {packages.map((pkg) => (
                    <CommandItem
                      key={pkg.id}
                      value={pkg.name}
                      onSelect={() => selectPackage(pkg.id)}
                      className="flex items-center cursor-pointer py-2"
                    >
                      {getServiceIcon(pkg.name)}
                      <div className="flex flex-col">
                        <span className="font-medium">{pkg.name}</span>
                        {pkg.description && (
                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
