
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
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectTextField 
          control={control} 
          name="name" 
          label="Project Name" 
          placeholder="Enter project name" 
        />
        <ProjectTextField
          control={control}
          name="slug"
          label="Portal Slug"
          placeholder="project-unique-identifier"
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectClientField control={control} />
        <ProjectStatusField control={control} />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectPriorityField control={control} />
        <ProjectDateField control={control} name="start_date" label="Start Date" />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectDateField control={control} name="due_date" label="Due Date" />
        <ProjectPackageField control={control} />
      </div>
      
      {/* Revenue field that spans full width */}
      <div>
        <ProjectRevenueField control={control} />
      </div>
    </div>
  );
}
