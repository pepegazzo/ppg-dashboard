import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  client: text('client').notNull(),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['active', 'completed', 'on-hold', 'planning'] }).notNull().default('planning'),
  budget: real('budget').notNull().default(0),
  spent: real('spent').notNull().default(0),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  progress: integer('progress').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  projectName: text('project_name').notNull(),
  amount: real('amount').notNull(),
  status: text('status', { enum: ['paid', 'pending', 'overdue'] }).notNull().default('pending'),
  dueDate: text('due_date').notNull(),
  issueDate: text('issue_date').notNull(),
  items: text('items'), // Stored as JSON string
  subtotal: real('subtotal'),
  retention: real('retention'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull().default(''),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  projects: text('projects').notNull(), // Stored as JSON string array
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;




