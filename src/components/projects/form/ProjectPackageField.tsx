
import { useState, useEffect } from "react";
import { Control, useController } from "react-hook-form";
import { Check, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormValues } from "./types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

export function ProjectPackageField({ control }: ProjectPackageFieldProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { field } = useController({
    name: "packages",
    control,
    defaultValue: [],
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

  useEffect(() => {
    // Update form value when selected packages change
    field.onChange(selectedPackages);
  }, [selectedPackages, field]);

  const togglePackage = (packageId: string) => {
    setSelectedPackages((current) => {
      if (current.includes(packageId)) {
        return current.filter(id => id !== packageId);
      } else {
        return [...current, packageId];
      }
    });
  };

  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : packageId;
  };

  return (
    <div className="space-y-2">
      <Label>Packages</Label>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start h-auto min-h-10 py-2"
          >
            <Package className="h-4 w-4 mr-2 opacity-70" />
            <span className="font-normal">
              {selectedPackages.length === 0 
                ? "Select packages..." 
                : `${selectedPackages.length} package${selectedPackages.length !== 1 ? 's' : ''} selected`
              }
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <div className="font-medium text-sm mb-2">Available Packages</div>
            {loading ? (
              <div className="p-2 text-sm text-muted-foreground">Loading packages...</div>
            ) : error ? (
              <div className="p-2 text-sm text-red-500">Error: {error}</div>
            ) : packages.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No packages available</div>
            ) : (
              <div className="max-h-[300px] overflow-auto">
                {packages.map((pkg) => (
                  <Button
                    key={pkg.id}
                    variant="ghost"
                    className="w-full justify-start mb-1 h-auto py-2"
                    onClick={() => togglePackage(pkg.id)}
                  >
                    <div className="mr-2 h-4 w-4 flex items-center justify-center">
                      {selectedPackages.includes(pkg.id) && <Check className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{pkg.name}</span>
                      {pkg.description && (
                        <span className="text-xs text-muted-foreground">{pkg.description}</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedPackages.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedPackages.map(packageId => (
            <Badge
              key={packageId}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => togglePackage(packageId)}
            >
              {getPackageName(packageId)}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
