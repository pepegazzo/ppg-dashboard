import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getServiceIcon } from "../form/ProjectPackageField";

interface ProjectPackageCellProps {
  packageName: string | null | undefined;
  projectId: string;
}

export function ProjectPackageCell({ 
  packageName: initialPackageName, 
  projectId 
}: ProjectPackageCellProps) {
  const [packages, setPackages] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPackageName, setCurrentPackageName] = useState(initialPackageName);
  const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(null);

  // Fetch available packages when the popover opens
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('package_types')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchPackages();
    }
  };

  const handleSelectPackage = async (packageId: string, packageName: string) => {
    try {
      setUpdatingPackageId(packageId);
      
      // First, check if a project_package relation already exists
      const { data: existingRelation, error: relationError } = await supabase
        .from('project_packages')
        .select('id')
        .eq('project_id', projectId)
        .maybeSingle();
        
      if (relationError) throw relationError;
      
      if (existingRelation) {
        // Update the existing relation
        const { error: updateError } = await supabase
          .from('project_packages')
          .update({ package_id: packageId })
          .eq('id', existingRelation.id);
          
        if (updateError) throw updateError;
      } else {
        // Create a new relation
        const { error: insertError } = await supabase
          .from('project_packages')
          .insert({
            project_id: projectId,
            package_id: packageId
          });
          
        if (insertError) throw insertError;
      }
      
      // Update local state with the new package name
      setCurrentPackageName(packageName);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating package:', error);
    } finally {
      setUpdatingPackageId(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer">
          {updatingPackageId ? (
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Updating...
            </span>
          ) : (
            currentPackageName ? (
              <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
                {getServiceIcon(currentPackageName)}
                <span className="truncate">{currentPackageName}</span>
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">No service</span>
            )
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading services...</span>
            </div>
          ) : (
            packages.map((pkg) => (
              <Button
                key={pkg.id}
                variant="ghost"
                size="sm"
                className={`justify-start ${currentPackageName === pkg.name ? 'bg-accent' : ''}`}
                onClick={() => handleSelectPackage(pkg.id, pkg.name)}
                disabled={updatingPackageId !== null}
              >
                <Badge variant="outline" className="w-full justify-start">
                  {getServiceIcon(pkg.name)}
                  {pkg.name}
                </Badge>
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
