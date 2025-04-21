
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Package, Heart, Wrench, Palette, Video, Globe, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServicePopoverProps {
  projectId: string;
  currentPackageName?: string | null;
  onPackageChange: (newPkg: { id: string, name: string } | null) => void;
  disabled?: boolean;
}

export function getServiceIcon(name: string) {
  switch (name.toLowerCase()) {
    case "branding":
      return <Heart className="h-4 w-4 mr-2 opacity-80 text-pink-500" />;
    case "custom":
      return <Wrench className="h-4 w-4 mr-2 opacity-70 text-slate-500" />;
    case "design":
      return <Palette className="h-4 w-4 mr-2 opacity-70 text-indigo-500" />;
    case "video":
      return <Video className="h-4 w-4 mr-2 opacity-70 text-orange-500" />;
    case "website":
      return <Globe className="h-4 w-4 mr-2 opacity-70 text-emerald-500" />;
    default:
      return <Package className="h-4 w-4 mr-2 opacity-70 text-neutral-500" />;
  }
}

export function ServicePopover({
  projectId,
  currentPackageName,
  onPackageChange,
  disabled = false,
}: ServicePopoverProps) {
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<{id: string, name: string, description: string | null}[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch available packages
  useEffect(() => {
    async function fetchPackages() {
      setFetching(true);
      const { data, error } = await supabase
        .from("package_types")
        .select("*")
        .order("name");
      if (!error && data) setPackages(data);
      setFetching(false);
    }
    if (open) fetchPackages();
  }, [open]);

  // When user picks a new package
  const handleSelect = async (pkgId: string) => {
    if (disabled) return;
    setLoading(true);

    // get the package name for the payload
    const selected = packages.find((p) => p.id === pkgId);
    // 1. Update the linkage in project_packages
    // Remove any old link for this project
    await supabase.from("project_packages").delete().eq("project_id", projectId);
    // 2. Create new link
    let newPkg = null;
    if (pkgId) {
      await supabase
        .from("project_packages")
        .insert({ project_id: projectId, package_id: pkgId });
      newPkg = selected || null;
    }
    // 3. Optionally update projects.package_name (legacy redundancy)
    if (newPkg) {
      await supabase
        .from("projects")
        .update({ package_name: newPkg.name })
        .eq("id", projectId);
    } else {
      await supabase
        .from("projects")
        .update({ package_name: null })
        .eq("id", projectId);
    }
    setLoading(false);
    setOpen(false);
    onPackageChange(newPkg);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Edit service"
          variant="ghost"
          size="sm"
          className="w-full flex px-0 py-0 h-auto min-h-6 rounded group border-0 shadow-none"
          disabled={disabled || loading}
          tabIndex={0}
        >
          <span className="flex items-center w-full">
            {currentPackageName ? (
              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1 text-xs w-full px-2 py-1 font-medium ring-0`}
              >
                {getServiceIcon(currentPackageName)}
                <span className="truncate">{currentPackageName}</span>
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs px-2">
                No package
              </span>
            )}
            <ChevronDown className="ml-1 h-4 w-4 group-hover:opacity-80 transition" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search services..." disabled={fetching} />
          <CommandEmpty>
            {fetching ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground pl-2">
                <Loader2 className="animate-spin h-4 w-4" /> Loading...
              </span>
            ) : (
              "No service found."
            )}
          </CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[310px] overflow-auto">
              {packages.map((pkg) => (
                <CommandItem
                  key={pkg.id}
                  value={pkg.name}
                  onSelect={() => handleSelect(pkg.id)}
                  disabled={loading}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  {getServiceIcon(pkg.name)}
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{pkg.name}</span>
                    {pkg.description && (
                      <span className="text-xs text-slate-500">{pkg.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
