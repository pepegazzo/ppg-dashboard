
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
      slug: "",
    },
  });

  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `INV-${randomNum}`;
  };

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);

      let clientName = "";
      if (values.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('company_name')
          .eq('id', values.client_id)
          .single();
        if (client) clientName = client.company_name;
      }

      const formattedStartDate = values.start_date ? values.start_date.toISOString().split('T')[0] : null;
      const formattedDueDate = values.due_date ? values.due_date.toISOString().split('T')[0] : null;

      // Check if the slug already exists in the database
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', values.slug)
        .maybeSingle();

      if (existingProject) {
        toast({
          title: "Duplicate Slug",
          description: "The portal slug you chose is already in use. Please pick another one.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Make sure the slug is properly formatted and saved
      const projectPayload = {
        name: values.name,
        client_id: values.client_id || null,
        client_name: clientName || "No Client",
        status: values.status,
        priority: values.priority,
        start_date: formattedStartDate,
        due_date: formattedDueDate,
        revenue: values.revenue || null,
        portal_password: null,
        slug: values.slug.trim().toLowerCase(),
      };

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectPayload)
        .select('id, name, client_name, revenue, portal_password, slug')
        .single();

      if (projectError) throw projectError;

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

      if (newProject.revenue) {
        const invoiceNumber = generateInvoiceNumber();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const invoiceData = {
          project_id: newProject.id,
          invoice_number: invoiceNumber,
          amount: newProject.revenue,
          status: "Pending",
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
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
