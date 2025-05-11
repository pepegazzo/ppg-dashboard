import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Project, PackageType } from "./types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ProjectFormValues } from "./form/types";
import { ProjectFormFields } from "./form/ProjectFormFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";

interface ProjectEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onProjectUpdated: () => void;
}

export function ProjectEditDialog({
  open,
  onOpenChange,
  project,
  onProjectUpdated
}: ProjectEditDialogProps) {
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
      package: [],
      revenue: undefined,
      slug: "",
    }
  });

  // Reset form with project data when project changes
  useEffect(() => {
    if (project) {
      const startDate = project.start_date ? new Date(project.start_date) : undefined;
      const dueDate = project.due_date ? new Date(project.due_date) : undefined;
      
      form.reset({
        name: project.name,
        client_id: project.client_id || undefined,
        client_name: project.client_name || "",
        status: project.status as any,
        priority: project.priority as any,
        start_date: startDate,
        due_date: dueDate,
        package: project.package_ids || [],
        revenue: project.revenue || undefined,
        slug: project.slug || ""
      });
    }
  }, [project, form]);

  const onSubmit = async (values: ProjectFormValues) => {
    if (!project) return;
    
    try {
      setIsSubmitting(true);
      
      let clientName = values.client_name || "";
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

      // Check if slug is unchanged or new and unique
      if (values.slug !== project.slug) {
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
      }

      const projectPayload = {
        name: values.name,
        client_id: values.client_id || null,
        client_name: clientName || "No Client",
        status: values.status,
        priority: values.priority,
        start_date: formattedStartDate,
        due_date: formattedDueDate,
        revenue: values.revenue || null,
        slug: values.slug.trim().toLowerCase(),
      };

      const { error: projectError } = await supabase
        .from('projects')
        .update(projectPayload)
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Handle package association - first delete all existing packages
      const { error: deleteError } = await supabase
        .from('project_packages')
        .delete()
        .eq('project_id', project.id);
        
      if (deleteError) throw deleteError;
      
      // Then add the new ones
      if (values.package && values.package.length > 0) {
        const packageData = values.package.map(packageId => ({
          project_id: project.id,
          package_id: packageId
        }));
        
        const { error: insertError } = await supabase
          .from('project_packages')
          .insert(packageData);
          
        if (insertError) throw insertError;
      }

      toast({
        title: "Project updated",
        description: `${values.name} has been successfully updated.`
      });

      onProjectUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
        description: error.message || "There was a problem updating the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ProjectFormFields control={form.control} />
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
