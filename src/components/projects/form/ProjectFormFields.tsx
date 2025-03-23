
import { Control } from "react-hook-form";
import { ProjectFormValues } from "./types";
import { ProjectTextField } from "./ProjectTextField";
import { ProjectStatusField } from "./ProjectStatusField";
import { ProjectPriorityField } from "./ProjectPriorityField";
import { ProjectDateField } from "./ProjectDateField";
import { ProjectPackageField } from "./ProjectPackageField";

interface ProjectFormFieldsProps {
  control: Control<ProjectFormValues>;
}

export function ProjectFormFields({ control }: ProjectFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProjectTextField 
        control={control} 
        name="name" 
        label="Project Name" 
        placeholder="Enter project name" 
      />
      
      <ProjectTextField 
        control={control} 
        name="client_name" 
        label="Client Name" 
        placeholder="Enter client name" 
      />
      
      <ProjectStatusField control={control} />
      
      <ProjectPriorityField control={control} />
      
      <ProjectDateField 
        control={control} 
        name="start_date" 
        label="Start Date" 
      />
      
      <ProjectDateField 
        control={control} 
        name="due_date" 
        label="Due Date" 
      />
      
      <div className="md:col-span-2">
        <ProjectPackageField control={control} />
      </div>
    </div>
  );
}
