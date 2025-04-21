
import { useState, useEffect } from "react";
import { Control, useController } from "react-hook-form";
import { Wrench, Palette, Video, Globe, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormValues } from "./types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  
  const { field } = useController({
    name: "package",
    control,
    defaultValue: "",
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

  const selectPackage = (packageId: string) => {
    field.onChange(packageId);
  };

  const getSelectedPackageName = () => {
    if (!field.value) return "";
    const pkg = packages.find(p => p.id === field.value);
    return pkg ? pkg.name : "";
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <Label>Service</Label>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start h-10 py-2"
          >
            {field.value ? (
              getServiceIcon(getSelectedPackageName())
            ) : (
              <Wrench className="h-4 w-4 mr-2 opacity-70" />
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
                    variant="ghost"
                    className="w-full justify-start mb-1 h-auto py-2"
                    onClick={() => selectPackage(pkg.id)}
                  >
                    {field.value === pkg.id && (
                      <span className="absolute left-2">•</span>
                    )}
                    <div className="flex items-center w-full">
                      {getServiceIcon(pkg.name)}
                      <div className="flex flex-col items-start">
                        <span>{pkg.name}</span>
                        {pkg.description && (
                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                        )}
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
  );
}
