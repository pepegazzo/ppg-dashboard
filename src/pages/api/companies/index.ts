import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { companies } from '../../../db/schema';
import { eq, like, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const db = drizzle(locals.runtime.env.DB);
  const url = new URL(request.url);
  const search = url.searchParams.get('search');

  try {
    let query = db.select().from(companies);

    if (search) {
      query = query.where(
        or(
          like(companies.name, `%${search}%`),
          like(companies.industry, `%${search}%`)
        )
      ) as any;
    }

    const allCompanies = await query;
    return new Response(JSON.stringify(allCompanies), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch companies' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = drizzle(locals.runtime.env.DB);

  try {
    const body = await request.json();
    const newCompany = {
      id: crypto.randomUUID(),
      name: body.name,
      industry: body.industry || null,
      website: body.website || null,
      phone: body.phone || null,
      address: body.address || null,
      logo: body.logo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(companies).values(newCompany);

    return new Response(JSON.stringify(newCompany), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return new Response(JSON.stringify({ error: 'Failed to create company' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
