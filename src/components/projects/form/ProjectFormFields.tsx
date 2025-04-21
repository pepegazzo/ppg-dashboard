
import { Control } from "react-hook-form";
import { ProjectFormValues } from "./types";
import { ProjectTextField } from "./ProjectTextField";
import { ProjectStatusField } from "./ProjectStatusField";
import { ProjectPriorityField } from "./ProjectPriorityField";
import { ProjectDateField } from "./ProjectDateField";
import { ProjectPackageField } from "./ProjectPackageField";
import { ProjectRevenueField } from "./ProjectRevenueField";
import { ProjectClientField } from "./ProjectClientField";

interface ProjectFormFieldsProps {
  control: Control<ProjectFormValues>;
}

export function ProjectFormFields({ control }: ProjectFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <ProjectTextField 
          control={control} 
          name="name" 
          label="Project Name" 
          placeholder="Enter project name" 
        />
      </div>
      <div>
        <ProjectTextField
          control={control}
          name="slug"
          label="Portal Slug"
          placeholder="project-unique-identifier"
        />
      </div>

      <div>
        <ProjectClientField control={control} />
      </div>
      <div>
        <ProjectStatusField control={control} />
      </div>

      <div>
        <ProjectPriorityField control={control} />
      </div>
      <div>
        <ProjectDateField control={control} name="start_date" label="Start Date" />
      </div>

      <div>
        <ProjectDateField control={control} name="due_date" label="Due Date" />
      </div>
      <div>
        <ProjectPackageField control={control} />
      </div>
      
      <div className="md:col-span-2">
        <ProjectRevenueField control={control} />
      </div>
    </div>
  );
}
