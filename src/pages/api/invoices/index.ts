import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { invoices } from '../../../db/schema';

// GET all invoices
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    const allInvoices = await db.select().from(invoices);
    
    // Parse items JSON string to array
    const parsedInvoices = allInvoices.map(invoice => ({
      ...invoice,
      items: invoice.items ? JSON.parse(invoice.items) : []
    }));
    
    return new Response(JSON.stringify(parsedInvoices), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST create new invoice
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as any;
    const db = getDb(locals.runtime.env);
    
    const newInvoice = {
      id: `INV-${Date.now()}`,
      projectId: body.projectId,
      projectName: body.projectName,
      amount: body.amount,
      status: body.status || 'pending',
      dueDate: body.dueDate,
      issueDate: body.issueDate,
      items: body.items ? JSON.stringify(body.items) : null,
      subtotal: body.subtotal || null,
      retention: body.retention || null,
      notes: body.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(invoices).values(newInvoice);
    
    // Return the invoice with parsed items
    const responseInvoice = {
      ...newInvoice,
      items: newInvoice.items ? JSON.parse(newInvoice.items) : []
    };
    
    return new Response(JSON.stringify(responseInvoice), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to create invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};



