import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { projects } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// GET all projects
export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = getDb(locals.runtime.env);
    const allProjects = await db.select().from(projects);
    
    return new Response(JSON.stringify(allProjects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch projects', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST create new project
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json() as any;
    const db = getDb(locals.runtime.env);
    
    const newProject = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(projects).values(newProject);
    
    return new Response(JSON.stringify(newProject), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return new Response(JSON.stringify({ error: 'Failed to create project', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


