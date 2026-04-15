import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { companies, contacts } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals }) => {
  const db = drizzle(locals.runtime.env.DB);
  const { id } = params;

  try {
    const company = await db.select().from(companies).where(eq(companies.id, id!)).get();

    if (!company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get contacts for this company
    const companyContacts = await db.select().from(contacts).where(eq(contacts.companyId, id!));

    return new Response(JSON.stringify({ ...company, contacts: companyContacts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch company' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const db = drizzle(locals.runtime.env.DB);
  const { id } = params;

  try {
    const body = await request.json();
    const updatedCompany = {
      name: body.name,
      industry: body.industry || null,
      website: body.website || null,
      phone: body.phone || null,
      address: body.address || null,
      logo: body.logo || null,
      updatedAt: new Date(),
    };

    await db.update(companies).set(updatedCompany).where(eq(companies.id, id!));

    const company = await db.select().from(companies).where(eq(companies.id, id!)).get();

    return new Response(JSON.stringify(company), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return new Response(JSON.stringify({ error: 'Failed to update company' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = drizzle(locals.runtime.env.DB);
  const { id } = params;

  try {
    await db.delete(companies).where(eq(companies.id, id!));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete company' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
