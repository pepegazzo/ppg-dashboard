
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { formSchema, ProjectFormValues } from "./form/types";
import { ProjectFormFields } from "./form/ProjectFormFields";
import { ProjectFormActions } from "./form/ProjectFormActions";
import { updateProjectRevenue } from "@/utils/projectRevenue";
import { Project } from "./types";

interface ProjectFormProps {
  project?: Project;
  onCancel: () => void;
  onSubmitted: () => void;
}

const ProjectForm = ({ project, onCancel, onSubmitted }: ProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!project;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      client_name: project?.client_name || "",
      status: project?.status || "Onboarding",
      priority: project?.priority || "Medium",
      start_date: project?.start_date ? new Date(project.start_date) : undefined,
      due_date: project?.due_date ? new Date(project.due_date) : undefined,
      package: project?.package_id || undefined,
      revenue: project?.revenue || undefined,
      client_id: project?.client_id || undefined,
    },
  });

  useEffect(() => {
    if (project) {
      // Load the project's package relationship
      const fetchProjectPackage = async () => {
        const { data, error } = await supabase
          .from('project_packages')
          .select('package_id')
          .eq('project_id', project.id)
          .maybeSingle();
          
        if (!error && data) {
          form.setValue('package', data.package_id);
        }
      };
      
      fetchProjectPackage();
    }
  }, [project, form]);

  const generateInvoiceNumber = () => {
    // Ensure exactly 3 digits between 100-999
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `INV-${randomNum}`;
  };

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      
      // If a client was selected, get their company_name
      let clientName = "";
      if (values.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('company_name')
          .eq('id', values.client_id)
          .single();
        
        if (client) {
          clientName = client.company_name;
        }
      }
      
      // Format dates as ISO strings for Supabase
      const formattedStartDate = values.start_date ? values.start_date.toISOString().split('T')[0] : null;
      const formattedDueDate = values.due_date ? values.due_date.toISOString().split('T')[0] : null;
      
      // Create properly typed data object for Supabase
      const projectPayload = {
        name: values.name,
        client_id: values.client_id || null,
        client_name: clientName || values.client_name || "No Client",
        status: values.status,
        priority: values.priority,
        start_date: formattedStartDate,
        due_date: formattedDueDate,
        revenue: values.revenue || null,
      };
      
      let projectId = project?.id;
      
      if (isEditing && projectId) {
        // Update existing project
        const { data: updatedProject, error: projectError } = await supabase
          .from('projects')
          .update(projectPayload)
          .eq('id', projectId)
          .select('id, name')
          .single();

        if (projectError) throw projectError;
        
        // Handle package association update
        if (values.package) {
          // Check if project_package relation exists
          const { data: existingPackage } = await supabase
            .from('project_packages')
            .select('id')
            .eq('project_id', projectId)
            .maybeSingle();
            
          if (existingPackage) {
            // Update existing relation
            const { error: packageError } = await supabase
              .from('project_packages')
              .update({ package_id: values.package })
              .eq('id', existingPackage.id);
              
            if (packageError) {
              console.error("Error updating package:", packageError);
              toast({
                title: "Warning",
                description: "Project updated but there was an error updating the package.",
                variant: "destructive",
              });
            }
          } else {
            // Create new relation
            const { error: packageError } = await supabase
              .from('project_packages')
              .insert({
                project_id: projectId,
                package_id: values.package
              });
              
            if (packageError) {
              console.error("Error linking package:", packageError);
              toast({
                title: "Warning",
                description: "Project updated but there was an error linking the package.",
                variant: "destructive",
              });
            }
          }
        }
        
        // Update project revenue
        await updateProjectRevenue(projectId);
        
        toast({
          title: "Success",
          description: "Project updated successfully.",
        });
      } else {
        // Insert new project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert(projectPayload)
          .select('id, name, client_name, revenue')
          .single();

        if (projectError) throw projectError;
        
        projectId = newProject.id;
        
        // If a package is selected, create package association
        if (values.package) {
          const packageData = {
            project_id: projectId,
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
        
        // Create a pending invoice for the project if revenue is specified
        if (newProject.revenue) {
          const invoiceNumber = generateInvoiceNumber();
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // Due date 30 days from now
          
          const invoiceData = {
            project_id: projectId,
            invoice_number: invoiceNumber,
            amount: newProject.revenue,
            status: "Pending",
            issue_date: new Date().toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            // No description for auto-generated invoices from project creation
          };
          
          const { error: invoiceError } = await supabase
            .from('invoices')
            .insert(invoiceData);
          
          if (invoiceError) {
            console.error("Error creating invoice:", invoiceError);
            toast({
              title: "Warning",
              description: "Project created but there was an error creating the associated invoice.",
              variant: "destructive",
            });
          } else {
            // Ensure project revenue is in sync with invoices
            await updateProjectRevenue(projectId);
            
            toast({
              title: "Success",
              description: "Project and pending invoice created successfully.",
            });
          }
        }
      }
      
      onSubmitted();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: isEditing ? "Error updating project" : "Error creating project",
        description: "There was a problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">
          {isEditing ? `Edit Project: ${project.name}` : "Create New Project"}
        </h2>
        
        <ProjectFormFields control={form.control} />
        
        <ProjectFormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel}
          isEditing={isEditing} 
        />
      </form>
    </Form>
  );
};

export default ProjectForm;
