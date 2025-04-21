
import { supabase } from "@/integrations/supabase/client";

export async function updateProjectRevenue(projectId: string) {
  try {
    console.log(`Updating revenue for project: ${projectId}`);
    
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
    console.log(`Calculated total revenue: ${totalRevenue} from ${invoices.length} invoices`);

    // Update project's revenue field
    const { data, error: updateError } = await supabase
      .from('projects')
      .update({ revenue: totalRevenue })
      .eq('id', projectId)
      .select('id, name, revenue');

    if (updateError) {
      console.error('Error updating project revenue:', updateError);
    } else if (data && data[0]) {
      console.log(`Successfully updated revenue for project ${data[0].name} to ${data[0].revenue}`);
    }
    
    return totalRevenue;
  } catch (error) {
    console.error('Unexpected error updating project revenue:', error);
  }
}

// Helper function to update revenue when an invoice amount changes
export async function updateProjectRevenueAfterInvoiceChange(projectId: string) {
  const newTotalRevenue = await updateProjectRevenue(projectId);
  return newTotalRevenue;
}
