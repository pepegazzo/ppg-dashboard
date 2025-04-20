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
      revenue: undefined,
    },
  });

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
        client_name: clientName || "No Client",
        status: values.status,
        priority: values.priority,
        start_date: formattedStartDate,
        due_date: formattedDueDate,
        revenue: values.revenue || null,
      };
      
      // Insert project into Supabase
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectPayload)
        .select('id, name, client_name, revenue')
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
      
      // Create a pending invoice for the project if revenue is specified
      if (newProject.revenue) {
        const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Due date 30 days from now
        
        const invoiceData = {
          project_id: newProject.id,
          invoice_number: invoiceNumber,
          amount: newProject.revenue,
          status: "Pending",
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          description: `Invoice for ${newProject.name} - ${newProject.client_name}`
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
          toast({
            title: "Success",
            description: "Project and pending invoice created successfully.",
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
