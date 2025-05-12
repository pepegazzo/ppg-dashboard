import { useState, useEffect } from "react";
import { Control, useController } from "react-hook-form";
import { Wrench, Palette, Video, Globe, Heart, Check, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormValues } from "./types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PackageType {
  id: string;
  name: string;
  description: string | null;
}

interface ProjectPackageFieldProps {
  control: Control<ProjectFormValues>;
}

export const getServiceIcon = (packageName: string) => {
  switch(packageName?.toLowerCase()) {
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
      return <Wrench className="h-4 w-4 mr-2 opacity-70" />;
  }
};

export function ProjectPackageField({ control }: ProjectPackageFieldProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  const { field } = useController({
    name: "package",
    control,
    defaultValue: [],
  });

  useEffect(() => {
    let mounted = true;
    
    async function fetchPackages() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('package_types')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        if (mounted) {
          setPackages(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching packages:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchPackages();
    
    return () => { mounted = false; };
  }, []);

  const isSelected = (packageId: string) => {
    return field.value.includes(packageId);
  };

  const togglePackage = (packageId: string) => {
    if (isSelected(packageId)) {
      field.onChange(field.value.filter(id => id !== packageId));
    } else {
      field.onChange([...field.value, packageId]);
    }
  };

  const getSelectedPackageNames = () => {
    return field.value.map(id => {
      const pkg = packages.find(p => p.id === id);
      return pkg ? pkg.name : "";
    }).filter(name => name);
  };

  const removePackage = (packageId: string) => {
    field.onChange(field.value.filter(id => id !== packageId));
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <Label>Services</Label>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 min-h-10">
          {getSelectedPackageNames().map((name, index) => (
            <Badge 
              key={index} 
              variant="table"
              className="gap-1"
            >
              {getServiceIcon(name)}
              <span className="text-xs">{name}</span>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 rounded-full hover:bg-muted" 
                onClick={() => removePackage(field.value[index])}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {name}</span>
              </Button>
            </Badge>
          ))}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-7 px-2 text-sm"
                type="button"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Service
              </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-[250px] p-0" align="start">
              <div className="p-2">
                <div className="font-medium text-sm mb-2">Available Services</div>
                {loading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading services...</div>
                ) : error ? (
                  <div className="p-2 text-sm text-red-500">Error: {error}</div>
                ) : packages.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No services available</div>
                ) : (
                  <div className="max-h-[300px] overflow-auto">
                    {packages.map((pkg) => (
                      <Button
                        key={pkg.id}
                        type="button"
                        variant="ghost"
                        className="w-full justify-start mb-1 h-auto py-2 relative"
                        onClick={() => {
                          togglePackage(pkg.id);
                        }}
                      >
                        <div className="flex items-center w-full">
                          {isSelected(pkg.id) && (
                            <Check className="h-3.5 w-3.5 absolute left-2" />
                          )}
                          <div className="flex items-center ml-6">
                            {getServiceIcon(pkg.name)}
                            <div className="flex flex-col items-start">
                              <span>{pkg.name}</span>
                              {pkg.description && (
                                <span className="text-xs text-muted-foreground">{pkg.description}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
