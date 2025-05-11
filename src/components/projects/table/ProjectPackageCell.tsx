
import { Badge } from "@/components/ui/badge";
import { Package as PackageIcon, Wrench, Palette, Video, Globe, Heart, Box } from "lucide-react";

interface ProjectPackageCellProps {
  project: any;
  readOnly: boolean;
}

export function ProjectPackageCell({ project, readOnly }: ProjectPackageCellProps) {
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
      case 'none':
        return <Box className="h-3 w-3 opacity-80 mr-1" />;
      default:
        return <PackageIcon className="h-3 w-3 opacity-80 mr-1" />;
    }
  };

  return (
    <Badge variant="outline" className="inline-flex items-center gap-1 text-xs w-fit">
      {project.package_name ? (
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
  );
}
