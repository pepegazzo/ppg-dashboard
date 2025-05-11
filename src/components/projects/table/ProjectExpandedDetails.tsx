
import React from "react";
import { Project } from "../types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Link as LinkIcon,
  User,
  Building,
  Tag
} from "lucide-react";

interface ProjectExpandedDetailsProps {
  project: Project;
}

export function ProjectExpandedDetails({ project }: ProjectExpandedDetailsProps) {
  return (
    <TableRow className="bg-muted/5 hover:bg-muted/10 animate-accordion-down">
      <TableCell className="p-0 w-[28px]" />
      <TableCell colSpan={11} className="py-4">
        <div className="p-4 grid grid-cols-3 gap-6 border-t border-muted/30">
          <div className="space-y-3 bg-muted/5 p-4 rounded-md">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" /> 
              Project Details
            </h4>
            <div className="space-y-2">
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">ID:</span> 
                <span className="text-muted-foreground font-mono">{project.id.substring(0, 8)}...</span>
              </p>
              {project.slug && (
                <p className="text-xs flex items-center justify-between">
                  <span className="font-medium">Slug:</span> 
                  <span className="text-muted-foreground">{project.slug}</span>
                </p>
              )}
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Created:</span> 
                <span className="text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
              </p>
              
              <div className="pt-2">
                <h5 className="text-xs font-medium flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" /> 
                  Contact Information
                </h5>
                <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                  {project.contact_id ? `Contact ID: ${project.contact_id}` : 'No contact assigned'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 bg-muted/5 p-4 rounded-md">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <Calendar className="w-4 h-4" /> 
              Timeline & Progress
            </h4>
            <div className="space-y-2">
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Start Date:</span> 
                <span className="text-muted-foreground">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </span>
              </p>
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Due Date:</span> 
                <span className="text-muted-foreground">
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                </span>
              </p>
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Progress:</span> 
                <span className="text-muted-foreground font-semibold">{project.progress}%</span>
              </p>
              
              <div className="pt-2">
                <h5 className="text-xs font-medium flex items-center gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" /> 
                  Project Status
                </h5>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {project.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {project.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 bg-muted/5 p-4 rounded-md">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <DollarSign className="w-4 h-4" /> 
              Financial Information
            </h4>
            <div className="space-y-2">
              <p className="text-xs flex items-center justify-between">
                <span className="font-medium">Revenue:</span> 
                <span className="text-muted-foreground font-semibold">{project.revenue ? `$${project.revenue.toLocaleString()}` : 'Not set'}</span>
              </p>
              {project.package_name && (
                <p className="text-xs flex items-center justify-between">
                  <span className="font-medium">Package:</span> 
                  <span className="text-muted-foreground">{project.package_name}</span>
                </p>
              )}
              
              <div className="pt-2">
                <h5 className="text-xs font-medium flex items-center gap-2 mb-2">
                  <Building className="w-3.5 h-3.5 text-muted-foreground" /> 
                  Client Information
                </h5>
                <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                  <span className="font-medium">Client:</span> {project.client_name}
                  {project.client_id && <span className="block text-xs opacity-75 mt-1">ID: {project.client_id}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
