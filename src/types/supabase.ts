
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          client_name: string
          status: string
          priority: string
          start_date: string
          due_date: string
          packages: string[]
          slug: string
          password: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          client_name: string
          status: string
          priority: string
          start_date: string
          due_date: string
          packages: string[]
          slug: string
          password?: string | null
          created_at: string
        }
        Update: {
          id?: string
          name?: string
          client_name?: string
          status?: string
          priority?: string
          start_date?: string
          due_date?: string
          packages?: string[]
          slug?: string
          password?: string | null
          created_at?: string
        }
      }
      stages: {
        Row: {
          id: string
          name: string
          project_id: string
        }
        Insert: {
          id: string
          name: string
          project_id: string
        }
        Update: {
          id?: string
          name?: string
          project_id?: string
        }
      }
      tasks: {
        Row: {
          id: string
          name: string
          completed: boolean
          description: string | null
          due_date: string | null
          stage_id: string
        }
        Insert: {
          id: string
          name: string
          completed: boolean
          description?: string | null
          due_date?: string | null
          stage_id: string
        }
        Update: {
          id?: string
          name?: string
          completed?: boolean
          description?: string | null
          due_date?: string | null
          stage_id?: string
        }
      }
    }
  }
}
