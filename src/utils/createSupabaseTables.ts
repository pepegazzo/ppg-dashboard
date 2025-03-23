
import { supabase } from '@/lib/supabase';

// This function can be run from a development environment to set up tables
export async function createSupabaseTables() {
  try {
    console.log('Creating Supabase tables...');
    
    // Create projects table
    const { error: projectsError } = await supabase.rpc('create_projects_table');
    if (projectsError) throw projectsError;
    
    // Create stages table
    const { error: stagesError } = await supabase.rpc('create_stages_table');
    if (stagesError) throw stagesError;
    
    // Create tasks table
    const { error: tasksError } = await supabase.rpc('create_tasks_table');
    if (tasksError) throw tasksError;
    
    console.log('Supabase tables created successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error creating Supabase tables:', error);
    return { success: false, error };
  }
}

// SQL Statements that should be run in Supabase SQL Editor:
/*
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  packages TEXT[] NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create stages table
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous access to projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to stages" ON stages
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to tasks" ON tasks
  FOR ALL USING (true);
*/
