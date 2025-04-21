
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { SquarePen, SquareCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getServiceIcon } from "../form/ProjectPackageField";
import { PackageType } from "../types";

interface BulkProjectActionsProps {
  selectedProjectIds: string[];
  packageTypes: PackageType[];
  onBulkUpdated?: () => void;
  clearSelection: () => void;
}

export function BulkProjectActions({
  selectedProjectIds,
  packageTypes,
  onBulkUpdated,
  clearSelection
}: BulkProjectActionsProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bulk update project packages
  const handlePackageSelect = async (pkg: PackageType) => {
    setLoading(true);
    setOpen(false);

    // 1. Update the project_packages table for all selected projects
    try {
      // First, remove previous package links (if any exist for those projects)
      const { error: delError } = await supabase
        .from('project_packages')
        .delete()
        .in('project_id', selectedProjectIds);

      if (delError) {
        console.error(delError);
      }
      // Then, insert the new link for each selected
      const inserts = selectedProjectIds.map(pid => ({ project_id: pid, package_id: pkg.id }));
      const { error: insertError } = await supabase
        .from('project_packages')
        .insert(inserts);

      // Optionally: Update local cache or refetch data
      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Services updated",
        description: `Updated service to "${pkg.name}" for ${selectedProjectIds.length} project(s).`,
        // Using description instead of icon since the Toast type doesn't support icon
        // This is what caused the TypeScript error
      });

      // Optionally tell parent to re-fetch
      if (onBulkUpdated) onBulkUpdated();
      // Deselect after update
      clearSelection();

    } catch (err: any) {
      toast({
        title: "Bulk update failed",
        description: err.message || "Could not update services for projects.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between gap-2 border border-muted-foreground/5 animate-fade-in">
      <span className="text-sm">{selectedProjectIds.length} project{selectedProjectIds.length !== 1 ? "s" : ""} selected</span>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <SquarePen className="h-4 w-4 mr-1" />
              Change Service
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search services..." disabled={loading}/>
              <CommandEmpty>No service found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {packageTypes.map(pkg => (
                    <CommandItem
                      key={pkg.id}
                      value={pkg.name}
                      onSelect={() => handlePackageSelect(pkg)}
                      className="flex items-center py-2"
                    >
                      {getServiceIcon(pkg.name)}
                      <span className="font-medium">{pkg.name}</span>
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          variant="destructive"
          size="sm"
          onClick={clearSelection}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
