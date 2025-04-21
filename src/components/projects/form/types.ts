
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client_id: z.string().optional(),
  client_name: z.string().optional(),
  status: z.enum(["Onboarding", "Active", "Completed", "Cancelled"]),
  priority: z.enum(["Low", "Medium", "High"]),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  package: z.string().optional(),
  revenue: z.number().optional(),
  slug: z.string()
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Slug can only contain letters, numbers, and hyphens",
    })
    .min(4, "Slug must be at least 4 characters")
    .max(40, "Slug too long"),
});

export type ProjectFormValues = z.infer<typeof formSchema>;
