
import { useState } from "react";
import { Project, ProjectStatus, ProjectPriority, ProjectPackage, Task, Stage } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Calendar as CalendarIcon, Check, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { projectStatuses, projectPriorities, projectPackages } from "@/data/projects";
import { v4 as uuidv4 } from "uuid";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: Project | Omit<Project, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const ProjectForm = ({ project, onSave, onDelete, onClose }: ProjectFormProps) => {
  const isNewProject = !project;

  const [formData, setFormData] = useState<Partial<Project>>(
    project || {
      name: "",
      clientName: "",
      status: "Onboarding" as ProjectStatus,
      priority: "Medium" as ProjectPriority,
      startDate: new Date(),
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      packages: [],
      slug: "",
      password: "",
      stages: [
        {
          id: uuidv4(),
          name: "Planning",
          tasks: [
            { id: uuidv4(), name: "Initial Meeting", completed: false }
          ]
        }
      ]
    }
  );

  const [errors, setErrors] = useState<{
    name?: string;
    clientName?: string;
    slug?: string;
    dueDate?: string;
  }>({});

  // Handle basic form field changes
  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related error
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle package selection
  const togglePackage = (pkg: ProjectPackage) => {
    const packages = formData.packages || [];
    if (packages.includes(pkg)) {
      handleChange('packages', packages.filter(p => p !== pkg));
    } else {
      handleChange('packages', [...packages, pkg]);
    }
  };

  // Handle stage and task updates
  const addStage = () => {
    const stages = [...(formData.stages || [])];
    stages.push({
      id: uuidv4(),
      name: "New Stage",
      tasks: []
    });
    handleChange('stages', stages);
  };

  const updateStage = (stageId: string, name: string) => {
    const stages = [...(formData.stages || [])];
    const index = stages.findIndex(s => s.id === stageId);
    if (index !== -1) {
      stages[index] = { ...stages[index], name };
      handleChange('stages', stages);
    }
  };

  const deleteStage = (stageId: string) => {
    const stages = formData.stages?.filter(s => s.id !== stageId) || [];
    handleChange('stages', stages);
  };

  const addTask = (stageId: string) => {
    const stages = [...(formData.stages || [])];
    const index = stages.findIndex(s => s.id === stageId);
    if (index !== -1) {
      stages[index].tasks.push({
        id: uuidv4(),
        name: "New Task",
        completed: false
      });
      handleChange('stages', stages);
    }
  };

  const updateTask = (stageId: string, taskId: string, updates: Partial<Task>) => {
    const stages = [...(formData.stages || [])];
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (stageIndex !== -1) {
      const tasks = [...stages[stageIndex].tasks];
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        stages[stageIndex].tasks = tasks;
        handleChange('stages', stages);
      }
    }
  };

  const deleteTask = (stageId: string, taskId: string) => {
    const stages = [...(formData.stages || [])];
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (stageIndex !== -1) {
      stages[stageIndex].tasks = stages[stageIndex].tasks.filter(t => t.id !== taskId);
      handleChange('stages', stages);
    }
  };

  // Auto-generate slug from project name
  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      handleChange('slug', slug);
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      clientName?: string;
      slug?: string;
      dueDate?: string;
    } = {};

    if (!formData.name) {
      newErrors.name = "Project name is required";
    }

    if (!formData.clientName) {
      newErrors.clientName = "Client name is required";
    }

    if (!formData.slug) {
      newErrors.slug = "Slug is required";
    }

    if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate) {
      newErrors.dueDate = "Due date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData as any);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={e => handleChange("name", e.target.value)}
              onBlur={generateSlug}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName || ""}
              onChange={e => handleChange("clientName", e.target.value)}
              className={errors.clientName ? "border-red-500" : ""}
            />
            {errors.clientName && <p className="text-xs text-red-500">{errors.clientName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={value => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {projectStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={value => handleChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {projectPriorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={date => handleChange("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-full justify-start text-left font-normal ${errors.dueDate ? "border-red-500" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={date => handleChange("dueDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
          </div>
        </div>
      </div>

      {/* Project Packages Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Project Packages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {projectPackages.map(pkg => (
            <div key={pkg} className="flex items-center space-x-2">
              <Checkbox 
                id={`package-${pkg}`} 
                checked={(formData.packages || []).includes(pkg)}
                onCheckedChange={() => togglePackage(pkg)}
              />
              <Label htmlFor={`package-${pkg}`}>{pkg}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Client Portal Access */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Client Portal Access</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">Portal URL Slug</Label>
            <div className="flex items-center gap-2">
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={e => handleChange("slug", e.target.value)}
                className={errors.slug ? "border-red-500" : ""}
              />
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generate
              </Button>
            </div>
            {errors.slug ? (
              <p className="text-xs text-red-500">{errors.slug}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Client portal will be accessible at: /client/{formData.slug || "your-slug"}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Portal Password (Optional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={e => handleChange("password", e.target.value)}
              placeholder="Leave blank for no password"
            />
          </div>
        </div>
      </div>

      {/* Stages & Tasks Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Stages & Tasks</h3>
          <Button type="button" variant="outline" onClick={addStage}>
            <Plus className="mr-2 h-4 w-4" /> Add Stage
          </Button>
        </div>

        <div className="space-y-6">
          {formData.stages?.map((stage) => (
            <Card key={stage.id} className="border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={stage.name}
                    onChange={e => updateStage(stage.id, e.target.value)}
                    className="text-lg font-medium border-0 p-0 h-auto focus-visible:ring-0"
                    placeholder="Stage Name"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteStage(stage.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stage.tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <Checkbox 
                        checked={task.completed} 
                        onCheckedChange={checked => 
                          updateTask(stage.id, task.id, { completed: !!checked })
                        } 
                      />
                      <Input
                        value={task.name}
                        onChange={e => 
                          updateTask(stage.id, task.id, { name: e.target.value })
                        }
                        className="flex-1 border-0 p-0 h-auto focus-visible:ring-0"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteTask(stage.id, task.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addTask(stage.id)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between space-x-4 pt-4">
        <div>
          {!isNewProject && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the project and all of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      onDelete(formData.id!);
                      onClose();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Check className="mr-2 h-4 w-4" /> {isNewProject ? "Create Project" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
