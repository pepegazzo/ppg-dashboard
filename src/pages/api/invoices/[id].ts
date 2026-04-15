import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { invoices } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// GET single invoice
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    const invoice = await db.select().from(invoices).where(eq(invoices.id, params.id!));
    
    if (invoice.length === 0) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(invoice[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT update invoice
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const body = await request.json() as any;
    const db = getDb(locals.runtime.env);
    
    await db.update(invoices)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(invoices.id, params.id!));
    
    const updated = await db.select().from(invoices).where(eq(invoices.id, params.id!));
    
    return new Response(JSON.stringify(updated[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to update invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE invoice
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    await db.delete(invoices).where(eq(invoices.id, params.id!));
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

