import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { projects } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// GET single project
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    const project = await db.select().from(projects).where(eq(projects.id, params.id!));
    
    if (project.length === 0) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(project[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT update project
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const body = await request.json() as any;
    const db = getDb(locals.runtime.env);
    
    await db.update(projects)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(projects.id, params.id!));
    
    const updated = await db.select().from(projects).where(eq(projects.id, params.id!));
    
    return new Response(JSON.stringify(updated[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return new Response(JSON.stringify({ error: 'Failed to update project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE project
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDb(locals.runtime.env);
    await db.delete(projects).where(eq(projects.id, params.id!));
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

