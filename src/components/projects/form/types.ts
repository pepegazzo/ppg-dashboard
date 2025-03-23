
import { z } from "zod";

// Define the schema to match the required fields in the database
export const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client_name: z.string().min(1, "Client name is required"),
  status: z.enum(["Onboarding", "Active", "Completed"]).default("Onboarding"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  packages: z.array(z.string()).default([]),
});

// Create a type from the schema
export type ProjectFormValues = z.infer<typeof formSchema>;
