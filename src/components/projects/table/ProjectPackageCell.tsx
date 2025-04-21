
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
import { useToast } from "@/hooks/use-toast";

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
  switch(packageName?.toLowerCase()) {
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

export function ProjectPackageCell({ project, updatingProjectId, setUpdatingProjectId }: ProjectPackageCellProps) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopover, setShowPopover] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    const fetchPackages = async () => {
      try {
        setLoading(true);
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

  const updateService = async (packageId: string | null, packageName: string | null) => {
    try {
      setShowPopover(false);
      setUpdatingProjectId(project.id);
      setIsUpdating(true);
      
      if (packageId) {
        // First, check if a relationship already exists
        const { data: existingPackage, error: checkError } = await supabase
          .from('project_packages')
          .select('*')
          .eq('project_id', project.id);
          
        if (checkError) {
          console.error("Error checking existing package:", checkError);
          toast({
            title: "Error updating service",
            description: checkError.message || "Please try again later.",
            variant: "destructive"
          });
          return;
        }
        
        if (existingPackage && existingPackage.length > 0) {
          // Update existing relationship
          const { error: updateError } = await supabase
            .from('project_packages')
            .update({ package_id: packageId })
            .eq('project_id', project.id);
            
          if (updateError) {
            console.error("Error updating package:", updateError);
            toast({
              title: "Error updating service",
              description: updateError.message || "Please try again later.",
              variant: "destructive"
            });
            return;
          }
        } else {
          // Create new relationship
          const { error: insertError } = await supabase
            .from('project_packages')
            .insert({ project_id: project.id, package_id: packageId });
            
          if (insertError) {
            console.error("Error creating package relationship:", insertError);
            toast({
              title: "Error updating service",
              description: insertError.message || "Please try again later.",
              variant: "destructive"
            });
            return;
          }
        }
        
        // Update local state to reflect change
        project.package_id = packageId;
        project.package_name = packageName;
        
        toast({
          title: "Service updated",
          description: `Service changed to ${packageName || "None"}`
        });
      } else {
        // Remove package assignment if packageId is null
        const { error: deleteError } = await supabase
          .from('project_packages')
          .delete()
          .eq('project_id', project.id);
          
        if (deleteError) {
          console.error("Error removing package:", deleteError);
          toast({
            title: "Error updating service",
            description: deleteError.message || "Please try again later.",
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        project.package_id = null;
        project.package_name = null;
        
        toast({
          title: "Service removed",
          description: "Project service has been unassigned"
        });
      }
    } catch (error: any) {
      console.error("Unexpected error updating service:", error);
      toast({
        title: "Error updating service",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setUpdatingProjectId(null);
    }
  };

  return (
    <TableCell>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent cursor-pointer" disabled={isUpdating || updatingProjectId === project.id}>
            <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
              {isUpdating || updatingProjectId === project.id ? (
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
              disabled={isUpdating || updatingProjectId === project.id}
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
                disabled={isUpdating || updatingProjectId === project.id}
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
