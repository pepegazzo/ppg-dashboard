
import { supabase } from "@/integrations/supabase/client";

export async function updateProjectRevenue(projectId: string) {
  try {
    // Get total amount from all invoices for this project
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('amount')
      .eq('project_id', projectId);

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return;
    }

    // Calculate total revenue from invoices
    const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);

    // Update project's revenue field
    const { error: updateError } = await supabase
      .from('projects')
      .update({ revenue: totalRevenue })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project revenue:', updateError);
    }
  } catch (error) {
    console.error('Unexpected error updating project revenue:', error);
  }
}
