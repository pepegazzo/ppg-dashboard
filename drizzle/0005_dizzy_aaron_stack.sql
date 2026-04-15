CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`industry` text,
	`website` text,
	`phone` text,
	`address` text,
	`logo` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `contacts` ADD `company_id` text REFERENCES companies(id);