import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { contacts } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// GET single contact
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    const contact = await db.select().from(contacts).where(eq(contacts.id, params.id!));
    
    if (contact.length === 0) {
      return new Response(JSON.stringify({ error: 'Contact not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const parsedContact = {
      ...contact[0],
      projects: contact[0].projects ? JSON.parse(contact[0].projects) : []
    };
    
    return new Response(JSON.stringify(parsedContact), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch contact' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT update contact
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const body = await request.json() as any;
    const db = getDb(locals.runtime.env);
    
    const updateData = {
      name: body.name,
      lastName: body.lastName || '',
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      role: body.role || '',
      projects: JSON.stringify(body.projects || []),
      updatedAt: new Date()
    };
    
    await db.update(contacts)
      .set(updateData)
      .where(eq(contacts.id, params.id!));
    
    const updated = await db.select().from(contacts).where(eq(contacts.id, params.id!));
    
    return new Response(JSON.stringify({
      ...updated[0],
      projects: updated[0].projects ? JSON.parse(updated[0].projects) : []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return new Response(JSON.stringify({ error: 'Failed to update contact' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE contact
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    await db.delete(contacts).where(eq(contacts.id, params.id!));
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete contact' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


