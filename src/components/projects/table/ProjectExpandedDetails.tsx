import React from "react";
import { Project } from "../types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, FileText, Link as LinkIcon, Key, Tag, Package } from "lucide-react";
import { ProjectPackageCell } from "./ProjectPackageCell";
import { updateProjectRevenue } from "@/utils/projectRevenue";
interface ProjectExpandedDetailsProps {
  project: Project;
}
export function ProjectExpandedDetails({
  project
}: ProjectExpandedDetailsProps) {
  // Process packages for the project
  const enhancedProject = {
    ...project,
    packages: project.package_names || []
  };

  // Calculate payment status based on revenue
  const paymentStatus = project.revenue && project.revenue > 0 ? "Paid" : "Pending";
  return <TableRow className="bg-muted/5 hover:bg-muted/10 animate-accordion-down">
      <TableCell className="p-0 w-[40px]" />
      <TableCell colSpan={10} className="">
        <div className="grid grid-cols-3 border-t border-muted/30 h-full">
          {/* Portal Info */}
          <div className="space-y-3 bg-muted/5 p-4 rounded-md h-full flex flex-col">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <LinkIcon className="w-4 h-4" /> 
              Portal Info
            </h4>
            <div className="space-y-2 flex-grow">
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Slug:</span> 
                <span className="text-muted-foreground">{project.slug || "Not set"}</span>
              </p>
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Password:</span> 
                <span className="text-muted-foreground font-mono">{project.portal_password || "Not set"}</span>
              </p>
              
              
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="space-y-3 bg-muted/5 p-4 rounded-md h-full flex flex-col">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <DollarSign className="w-4 h-4" /> 
              Payment Info
            </h4>
            <div className="space-y-2 flex-grow">
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Revenue:</span> 
                <span className="text-muted-foreground font-semibold">
                  {project.revenue ? `$${project.revenue.toLocaleString()}` : 'Not set'}
                </span>
              </p>
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Payment Status:</span> 
                <span className="text-xs text-muted-foreground">
                  {paymentStatus}
                </span>
              </p>
              
              
            </div>
          </div>
          
          {/* Project Details */}
          <div className="space-y-3 bg-muted/5 p-4 rounded-md h-full flex flex-col">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <Package className="w-4 h-4" /> 
              Project Services
            </h4>
            <div className="space-y-4 flex-grow">
              {enhancedProject.packages && enhancedProject.packages.length > 0 ? <div className="flex flex-wrap gap-2">
                  {enhancedProject.packages.map((packageName, index) => <Badge key={index} variant="outline" className="text-xs bg-zinc-50 border-zinc-200">
                      {packageName}
                    </Badge>)}
                </div> : <p className="text-xs text-muted-foreground">No packages assigned</p>}
              
              
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>;
}