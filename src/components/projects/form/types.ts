
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client_id: z.string().optional(),
  client_name: z.string().optional(),
  status: z.enum(["Onboarding", "Active", "Completed"]),
  priority: z.enum(["Low", "Medium", "High"]),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  package: z.string().optional(),
  revenue: z.number().optional(),
});

export type ProjectFormValues = z.infer<typeof formSchema>;
