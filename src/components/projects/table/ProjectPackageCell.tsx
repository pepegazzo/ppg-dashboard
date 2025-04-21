
import { useEffect, useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Loader2, Package as PackageIcon, Wrench, Palette, Video, Globe, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PackageType {
  id: string;
  name: string;
  description: string | null;
}

interface ProjectPackageCellProps {
  project: any;
  updatingProjectId: string | null;
  setUpdatingProjectId: (id: string | null) => void;
  onUpdate: (projectId: string, field: string, value: string) => void;
}

const getServiceIcon = (packageName: string) => {
  switch(packageName.toLowerCase()) {
    case 'branding':
      return <Heart className="h-3 w-3 opacity-80 mr-1" />;
    case 'custom':
      return <Wrench className="h-3 w-3 opacity-80 mr-1" />;
    case 'design':
      return <Palette className="h-3 w-3 opacity-80 mr-1" />;
    case 'video':
      return <Video className="h-3 w-3 opacity-80 mr-1" />;
    case 'website':
      return <Globe className="h-3 w-3 opacity-80 mr-1" />;
    default:
      return <PackageIcon className="h-3 w-3 opacity-80 mr-1" />;
  }
};

export function ProjectPackageCell({ project, updatingProjectId, setUpdatingProjectId, onUpdate }: ProjectPackageCellProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from("package_types")
          .select("*")
          .order("name");
          
        if (mounted && data) {
          setPackages(data);
        }
        
        if (error) {
          console.error("Error fetching package types:", error);
        }
      } catch (err) {
        console.error("Unexpected error fetching package types:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchPackages();
    
    return () => { mounted = false; }
  }, []);

  const updateService = (packageId: string | null, name?: string | null) => {
    setShowPopover(false);
    setUpdatingProjectId(project.id);
    onUpdate(project.id, "package_id", packageId || "");
    onUpdate(project.id, "package_name", name || "");
  };

  const currentPkg = packages.find(pkg => pkg.id === project.package_id);

  return (
    <TableCell>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer" disabled={updatingProjectId === project.id}>
            <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
              {updatingProjectId === project.id ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Updating...
                </>
              ) : project.package_name ? (
                <>
                  {getServiceIcon(project.package_name)}
                  <span className="truncate max-w-[96px]">{project.package_name}</span>
                </>
              ) : (
                <>
                  <PackageIcon className="h-3 w-3 shrink-0 opacity-70 mr-1" />
                  <span className="text-muted-foreground">No service</span>
                </>
              )}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm"
              className={`justify-start ${!project.package_id ? "bg-blue-50" : ""}`}
              onClick={() => updateService(null, null)}
              disabled={updatingProjectId === project.id}
            >
              <Badge variant="secondary">{getServiceIcon("none")}Unassigned</Badge>
            </Button>
            {loading && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <Loader2 className="animate-spin h-3 w-3" /> Loading...
              </div>
            )}
            {!loading && packages.map((pkg) => (
              <Button
                key={pkg.id}
                variant="ghost"
                size="sm"
                className={`justify-start ${project.package_id === pkg.id ? "bg-blue-50" : ""} text-left`}
                onClick={() => updateService(pkg.id, pkg.name)}
                disabled={updatingProjectId === project.id}
              >
                <Badge className="flex gap-1 items-center px-2 py-1 font-normal">
                  {getServiceIcon(pkg.name)}
                  <span>{pkg.name}</span>
                </Badge>
                {pkg.description && (
                  <span className="ml-2 text-xs text-muted-foreground">{pkg.description}</span>
                )}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}
