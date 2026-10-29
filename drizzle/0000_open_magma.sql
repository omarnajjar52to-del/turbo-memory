CREATE TABLE `fitness_changes` (
	`user_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`collection` text NOT NULL,
	`record_key` text NOT NULL,
	`value_json` text NOT NULL,
	`created_at` text NOT NULL,
	`applied` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `operation_id`)
);
--> statement-breakpoint
CREATE TABLE `fitness_records` (
	`user_id` text NOT NULL,
	`collection` text NOT NULL,
	`record_key` text NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`user_id`, `collection`, `record_key`)
);
