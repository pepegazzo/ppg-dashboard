
import { Project } from "@/types/project";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Onboarding":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate task completion stats
  const totalTasks = project.stages.flatMap(stage => stage.tasks).length;
  const completedTasks = project.stages.flatMap(stage => stage.tasks).filter(task => task.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(project)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>
        <p className="text-sm text-gray-500">{project.clientName}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.packages.slice(0, 2).map((pkg, index) => (
            <Badge key={index} variant="outline" className="bg-gray-50">
              {pkg}
            </Badge>
          ))}
          {project.packages.length > 2 && (
            <Badge variant="outline" className="bg-gray-50">
              +{project.packages.length - 2} more
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <CalendarDays className="h-4 w-4" />
          <span>
            {format(project.startDate, "MMM d")} - {format(project.dueDate, "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority} Priority
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {completedTasks}/{totalTasks} tasks ({completionPercentage}%)
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
