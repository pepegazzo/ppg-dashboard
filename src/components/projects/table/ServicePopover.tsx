
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
      return <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-pink-500"><span aria-hidden="true">❤️</span></Badge>;
    case "custom":
      return <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-slate-500"><span aria-hidden="true">🔧</span></Badge>;
    case "design":
      return <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-indigo-500"><span aria-hidden="true">🎨</span></Badge>;
    case "video":
      return <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-orange-500"><span aria-hidden="true">📹</span></Badge>;
    case "website":
      return <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-emerald-500"><span aria-hidden="true">🌐</span></Badge>;
    default:
      return <Badge variant="outline" className="inline-flex items-center gap-1 text-xs text-neutral-500"><span aria-hidden="true">📦</span></Badge>;
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

  useEffect(() => {
    async function fetchPackages() {
      setLoading(true);
      const { data, error } = await supabase
        .from("package_types")
        .select("*")
        .order("name");
      if (!error && data) setPackages(data);
      setLoading(false);
    }
    if (open) fetchPackages();
  }, [open]);

  const handleSelect = async (pkgId: string) => {
    if (disabled) return;
    setLoading(true);
    const selected = packages.find((p) => p.id === pkgId);
    await supabase.from("project_packages").delete().eq("project_id", projectId);
    let newPkg = null;
    if (pkgId) {
      await supabase.from("project_packages").insert({ project_id: projectId, package_id: pkgId });
      newPkg = selected || null;
    }
    if (newPkg) {
      await supabase
        .from("projects")
        .update({ 
          client_name: newPkg.name 
        })
        .eq("id", projectId);
    } else {
      await supabase
        .from("projects")
        .update({ 
          client_name: null 
        })
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
          className="w-full flex px-1 py-1 h-auto min-h-6 rounded-full group border-0 shadow-none"
          disabled={disabled || loading}
          tabIndex={0}
        >
          {currentPackageName ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 text-xs px-2 py-1 font-medium ring-0 truncate w-full"
            >
              {getServiceIcon(currentPackageName)}
              <span className="truncate">{currentPackageName}</span>
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs px-2">
              No package
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[200px] p-1">
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-2">Loading...</div>
          ) : packages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-2">No services available</div>
          ) : (
            packages.map(pkg => (
              <Button
                key={pkg.id}
                variant="ghost"
                size="sm"
                className="justify-start rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={() => handleSelect(pkg.id)}
                disabled={loading}
              >
                {getServiceIcon(pkg.name)}
                <div className="flex flex-col text-left truncate">
                  <span className="font-medium truncate">{pkg.name}</span>
                  {pkg.description && (
                    <span className="text-xs text-muted-foreground truncate">{pkg.description}</span>
                  )}
                </div>
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

