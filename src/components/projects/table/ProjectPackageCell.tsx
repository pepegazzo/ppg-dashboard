
import { Badge } from "@/components/ui/badge";
import { Package as PackageIcon, Wrench, Palette, Video, Globe, Heart, Box, Tags } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // For all packages
  const packages = project.packages || [];
  const mainPackage = project.package_name || (packages.length > 0 ? packages[0] : null);
  const additionalPackages = packages.length > 1 ? packages.slice(1) : [];

  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline" className="bg-zinc-50 border-zinc-200">
        {mainPackage ? (
          <>
            {getServiceIcon(mainPackage)}
            <span className="truncate max-w-[96px]">{mainPackage}</span>
          </>
        ) : (
          <>
            <PackageIcon className="h-3 w-3 shrink-0 opacity-70 mr-1" />
            <span className="text-muted-foreground">No package</span>
          </>
        )}
      </Badge>
      
      {additionalPackages.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-1 bg-zinc-50 border-zinc-200">
                <Tags className="h-2.5 w-2.5" />
                +{additionalPackages.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-[200px]">
              <div className="text-xs">
                Additional packages:
                <ul className="mt-1 list-disc pl-4">
                  {additionalPackages.map((pkg, i) => (
                    <li key={i}>{pkg}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
