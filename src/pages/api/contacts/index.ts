import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { contacts } from '../../../db/schema';

// GET all contacts
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    const allContacts = await db.select().from(contacts);
    
    // Parse projects JSON string back to array, handling null/empty values
    const parsedContacts = allContacts.map(contact => ({
      ...contact,
      projects: contact.projects ? JSON.parse(contact.projects) : []
    }));
    
    return new Response(JSON.stringify(parsedContacts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch contacts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST create new contact
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as any;
    const db = getDb(locals.runtime.env);
    
    const newContact = {
      id: crypto.randomUUID(),
      name: body.name,
      lastName: body.lastName || '',
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      role: body.role || '',
      projects: JSON.stringify(body.projects || []),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(contacts).values(newContact);
    
    return new Response(JSON.stringify({
      ...newContact,
      projects: JSON.parse(newContact.projects)
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


