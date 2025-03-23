
import { supabase } from '@/lib/supabase';
import { Project, Stage, Task } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

export async function getProjects(): Promise<Project[]> {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  if (!projects) return [];

  // Fetch related stages and tasks for each project
  const projectsWithStages = await Promise.all(
    projects.map(async (project) => {
      const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('project_id', project.id);

      if (stagesError) {
        console.error('Error fetching stages:', stagesError);
        return { ...project, stages: [] };
      }

      const stagesWithTasks = await Promise.all(
        (stages || []).map(async (stage) => {
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('stage_id', stage.id);

          if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
            return { ...stage, tasks: [] };
          }

          return {
            id: stage.id,
            name: stage.name,
            tasks: tasks || []
          } as Stage;
        })
      );

      return {
        ...project,
        startDate: new Date(project.start_date),
        dueDate: new Date(project.due_date),
        createdAt: new Date(project.created_at),
        stages: stagesWithTasks
      } as Project;
    })
  );

  return projectsWithStages;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  // First create the project
  const newProject = {
    id: uuidv4(),
    name: project.name,
    client_name: project.clientName,
    status: project.status,
    priority: project.priority,
    start_date: project.startDate.toISOString(),
    due_date: project.dueDate.toISOString(),
    packages: project.packages,
    slug: project.slug,
    password: project.password,
    created_at: new Date().toISOString()
  };

  const { data: createdProject, error } = await supabase
    .from('projects')
    .insert([newProject])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  if (!createdProject) {
    throw new Error('Failed to create project');
  }

  // Now create stages and tasks
  const stagesWithTasks = await Promise.all(
    project.stages.map(async (stage) => {
      const newStage = {
        id: uuidv4(),
        name: stage.name,
        project_id: createdProject.id
      };

      const { data: createdStage, error: stageError } = await supabase
        .from('stages')
        .insert([newStage])
        .select()
        .single();

      if (stageError) {
        console.error('Error creating stage:', stageError);
        throw stageError;
      }

      if (!createdStage) {
        throw new Error('Failed to create stage');
      }

      const tasks = await Promise.all(
        stage.tasks.map(async (task) => {
          const newTask = {
            id: uuidv4(),
            name: task.name,
            completed: task.completed,
            description: task.description || null,
            due_date: task.dueDate ? task.dueDate.toISOString() : null,
            stage_id: createdStage.id
          };

          const { data: createdTask, error: taskError } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

          if (taskError) {
            console.error('Error creating task:', taskError);
            throw taskError;
          }

          return createdTask;
        })
      );

      return {
        ...createdStage,
        tasks
      } as unknown as Stage;
    })
  );

  return {
    ...createdProject,
    startDate: new Date(createdProject.start_date),
    dueDate: new Date(createdProject.due_date),
    createdAt: new Date(createdProject.created_at),
    clientName: createdProject.client_name,
    stages: stagesWithTasks
  } as Project;
}

export async function updateProject(project: Project): Promise<Project> {
  const updatedProject = {
    name: project.name,
    client_name: project.clientName,
    status: project.status,
    priority: project.priority,
    start_date: project.startDate.toISOString(),
    due_date: project.dueDate.toISOString(),
    packages: project.packages,
    slug: project.slug,
    password: project.password
  };

  const { error } = await supabase
    .from('projects')
    .update(updatedProject)
    .eq('id', project.id);

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  // Handle stages: delete removed ones, update existing ones, create new ones
  const { data: existingStages, error: stagesError } = await supabase
    .from('stages')
    .select('id')
    .eq('project_id', project.id);

  if (stagesError) {
    console.error('Error fetching stages:', stagesError);
    throw stagesError;
  }

  const existingStageIds = (existingStages || []).map(stage => stage.id);
  const updatedStageIds = project.stages.map(stage => stage.id);

  // Delete stages that are not in the updated project
  const stagesToDelete = existingStageIds.filter(id => !updatedStageIds.includes(id));
  if (stagesToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('stages')
      .delete()
      .in('id', stagesToDelete);

    if (deleteError) {
      console.error('Error deleting stages:', deleteError);
      throw deleteError;
    }
  }

  // Update or create stages and their tasks
  await Promise.all(
    project.stages.map(async (stage) => {
      if (existingStageIds.includes(stage.id)) {
        // Update existing stage
        const { error: updateStageError } = await supabase
          .from('stages')
          .update({ name: stage.name })
          .eq('id', stage.id);

        if (updateStageError) {
          console.error('Error updating stage:', updateStageError);
          throw updateStageError;
        }
      } else {
        // Create new stage
        const { error: createStageError } = await supabase
          .from('stages')
          .insert([{
            id: stage.id,
            name: stage.name,
            project_id: project.id
          }]);

        if (createStageError) {
          console.error('Error creating stage:', createStageError);
          throw createStageError;
        }
      }

      // Handle tasks for this stage
      const { data: existingTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('stage_id', stage.id);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      const existingTaskIds = (existingTasks || []).map(task => task.id);
      const updatedTaskIds = stage.tasks.map(task => task.id);

      // Delete tasks that are not in the updated stage
      const tasksToDelete = existingTaskIds.filter(id => !updatedTaskIds.includes(id));
      if (tasksToDelete.length > 0) {
        const { error: deleteTaskError } = await supabase
          .from('tasks')
          .delete()
          .in('id', tasksToDelete);

        if (deleteTaskError) {
          console.error('Error deleting tasks:', deleteTaskError);
          throw deleteTaskError;
        }
      }

      // Update or create tasks
      await Promise.all(
        stage.tasks.map(async (task) => {
          if (existingTaskIds.includes(task.id)) {
            // Update existing task
            const { error: updateTaskError } = await supabase
              .from('tasks')
              .update({
                name: task.name,
                completed: task.completed,
                description: task.description || null,
                due_date: task.dueDate ? task.dueDate.toISOString() : null
              })
              .eq('id', task.id);

            if (updateTaskError) {
              console.error('Error updating task:', updateTaskError);
              throw updateTaskError;
            }
          } else {
            // Create new task
            const { error: createTaskError } = await supabase
              .from('tasks')
              .insert([{
                id: task.id,
                name: task.name,
                completed: task.completed,
                description: task.description || null,
                due_date: task.dueDate ? task.dueDate.toISOString() : null,
                stage_id: stage.id
              }]);

            if (createTaskError) {
              console.error('Error creating task:', createTaskError);
              throw createTaskError;
            }
          }
        })
      );
    })
  );

  // Return the updated project with all its stages and tasks
  return await getProjectById(project.id);
}

export async function getProjectById(id: string): Promise<Project> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    throw error;
  }

  if (!project) {
    throw new Error(`Project with id ${id} not found`);
  }

  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('*')
    .eq('project_id', project.id);

  if (stagesError) {
    console.error('Error fetching stages:', stagesError);
    throw stagesError;
  }

  const stagesWithTasks = await Promise.all(
    (stages || []).map(async (stage) => {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('stage_id', stage.id);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      return {
        id: stage.id,
        name: stage.name,
        tasks: (tasks || []).map(task => ({
          id: task.id,
          name: task.name,
          completed: task.completed,
          description: task.description || undefined,
          dueDate: task.due_date ? new Date(task.due_date) : undefined
        }))
      } as Stage;
    })
  );

  return {
    id: project.id,
    name: project.name,
    clientName: project.client_name,
    status: project.status,
    priority: project.priority,
    startDate: new Date(project.start_date),
    dueDate: new Date(project.due_date),
    packages: project.packages,
    slug: project.slug,
    password: project.password,
    stages: stagesWithTasks,
    createdAt: new Date(project.created_at)
  } as Project;
}

export async function deleteProject(id: string): Promise<void> {
  // First delete all tasks and stages to comply with foreign key constraints
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('id')
    .eq('project_id', id);

  if (stagesError) {
    console.error('Error fetching stages for deletion:', stagesError);
    throw stagesError;
  }

  const stageIds = (stages || []).map(stage => stage.id);
  
  if (stageIds.length > 0) {
    // Delete all tasks for these stages
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .in('stage_id', stageIds);

    if (tasksError) {
      console.error('Error deleting tasks:', tasksError);
      throw tasksError;
    }

    // Delete the stages
    const { error: deleteStagesError } = await supabase
      .from('stages')
      .delete()
      .in('id', stageIds);

    if (deleteStagesError) {
      console.error('Error deleting stages:', deleteStagesError);
      throw deleteStagesError;
    }
  }

  // Finally delete the project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}
