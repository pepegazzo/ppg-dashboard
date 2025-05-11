
import React from "react";
import { Project } from "../types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Link as LinkIcon
} from "lucide-react";

interface ProjectExpandedDetailsProps {
  project: Project;
}

export function ProjectExpandedDetails({ project }: ProjectExpandedDetailsProps) {
  return (
    <TableRow className="bg-muted/5 hover:bg-muted/10">
      <TableCell className="p-0 w-[28px]" />
      <TableCell colSpan={11} className="py-4">
        <div className="p-2 grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> 
              Project Details
            </h4>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">ID:</span> {project.id}
              </p>
              {project.slug && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Slug:</span> {project.slug}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" /> 
              Timeline
            </h4>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Start Date:</span> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Due Date:</span> {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Progress:</span> {project.progress}%
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" /> 
              Financial
            </h4>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Revenue:</span> {project.revenue ? `$${project.revenue.toLocaleString()}` : 'Not set'}
              </p>
              {project.package_name && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Package:</span> {project.package_name}
                </p>
              )}
              <div className="flex items-center gap-1 pt-1">
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
      </TableCell>
    </TableRow>
  );
}
