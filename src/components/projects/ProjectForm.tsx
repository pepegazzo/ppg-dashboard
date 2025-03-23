
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { formSchema, ProjectFormValues } from "./form/types";
import { ProjectFormFields } from "./form/ProjectFormFields";
import { ProjectFormActions } from "./form/ProjectFormActions";

interface ProjectFormProps {
  onCancel: () => void;
  onSubmitted: () => void;
}

const ProjectForm = ({ onCancel, onSubmitted }: ProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_name: "",
      status: "Onboarding",
      priority: "Medium",
      start_date: undefined,
      due_date: undefined,
      package: undefined,
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create properly typed data object for Supabase
      const projectPayload = {
        name: values.name,
        client_name: values.client_name,
        status: values.status,
        priority: values.priority,
        start_date: values.start_date || null,
        due_date: values.due_date || null,
      };
      
      // Insert project into Supabase
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectPayload)
        .select('id')
        .single();

      if (projectError) throw projectError;
      
      // If a package is selected, create package association
      if (values.package) {
        const packageData = {
          project_id: newProject.id,
          package_id: values.package
        };
        
        const { error: packageError } = await supabase
          .from('project_packages')
          .insert(packageData);
          
        if (packageError) {
          console.error("Error linking package:", packageError);
          toast({
            title: "Warning",
            description: "Project created but there was an error linking the package.",
            variant: "destructive",
          });
        }
      }
      
      onSubmitted();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: "There was a problem creating the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Create New Project</h2>
        
        <ProjectFormFields control={form.control} />
        
        <ProjectFormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
        />
      </form>
    </Form>
  );
};

export default ProjectForm;
