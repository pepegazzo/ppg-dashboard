
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code } from 'lucide-react';

const SetupInstructions: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('SQL copied to clipboard!');
  };

  const sqlScript = `-- Create projects table
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
  FOR ALL USING (true);`;

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>Supabase Setup Instructions</CardTitle>
        <CardDescription>
          Follow these steps to set up your Supabase database tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sql">
          <TabsList>
            <TabsTrigger value="sql">SQL Setup</TabsTrigger>
            <TabsTrigger value="steps">Step-by-Step Guide</TabsTrigger>
          </TabsList>
          <TabsContent value="sql">
            <Card>
              <CardHeader className="bg-zinc-100 border-b py-2">
                <div className="flex justify-between items-center">
                  <p className="font-mono text-sm">SQL Script</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(sqlScript)}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4 rounded-md bg-zinc-950 text-zinc-200">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {sqlScript}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="steps">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-medium">Log in to your Supabase account</p>
                <p className="text-sm text-zinc-600">Go to dashboard.supabase.com and sign in to your account.</p>
              </li>
              <li>
                <p className="font-medium">Open the SQL Editor</p>
                <p className="text-sm text-zinc-600">In your project, navigate to the "SQL Editor" section from the left sidebar.</p>
              </li>
              <li>
                <p className="font-medium">Create a new query</p>
                <p className="text-sm text-zinc-600">Click "New Query" and paste the SQL script from the "SQL Setup" tab.</p>
              </li>
              <li>
                <p className="font-medium">Run the query</p>
                <p className="text-sm text-zinc-600">Click the "Run" button to execute the SQL and create your tables.</p>
              </li>
              <li>
                <p className="font-medium">Verify the tables were created</p>
                <p className="text-sm text-zinc-600">Go to the "Table Editor" section to confirm your tables exist: projects, stages, and tasks.</p>
              </li>
              <li>
                <p className="font-medium">Return to your application</p>
                <p className="text-sm text-zinc-600">Your app should now be able to connect to Supabase and use these tables.</p>
              </li>
            </ol>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-zinc-500">
          After setting up your tables, you'll be able to create, read, update, and delete projects, stages, and tasks.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SetupInstructions;
