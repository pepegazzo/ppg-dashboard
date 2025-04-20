
import React, { useState, useEffect } from "react";
import { Package, Wrench, Palette, Video, Globe, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServiceIcon } from "../form/ProjectPackageField";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('package_types')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleSelectPackage = async (packageId: string) => {
    try {
      setLoading(true);
      
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
      
      // Get the name of the selected package
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      if (selectedPackage) {
        setCurrentPackageName(selectedPackage.name);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating package:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent"
          disabled={loading}
        >
          {currentPackageName ? (
            <Badge variant="outline" className="inline-flex items-center text-xs w-fit">
              {getServiceIcon(currentPackageName)}
              <span className="truncate">{currentPackageName}</span>
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">No service</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="flex flex-col gap-1">
          {packages.map((pkg) => (
            <Button
              key={pkg.id}
              variant="ghost"
              size="sm"
              className={`justify-start ${currentPackageName === pkg.name ? 'bg-accent' : ''}`}
              onClick={() => handleSelectPackage(pkg.id)}
              disabled={loading}
            >
              <Badge variant="outline" className="w-full justify-start">
                {getServiceIcon(pkg.name)}
                {pkg.name}
              </Badge>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
