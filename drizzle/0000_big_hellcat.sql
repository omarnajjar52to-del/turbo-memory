CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`must_change_password` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_username_unique` ON `accounts` (`username`);--> statement-breakpoint
CREATE TABLE `assignment_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`club_id` text NOT NULL,
	`title` text NOT NULL,
	`program_json` text NOT NULL,
	`assigned_by` text NOT NULL,
	`assigned_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`member_id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`title` text NOT NULL,
	`program_json` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`assigned_by` text NOT NULL,
	`assigned_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`window_start` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`member_id` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkin_once` ON `checkins` (`member_id`,`date`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`currency` text DEFAULT 'IQD' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`age` integer,
	`height` real,
	`start_weight` real,
	`role` text DEFAULT 'member' NOT NULL,
	`goal` text DEFAULT '' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`fee` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_user_club` ON `members` (`club_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_username_club` ON `members` (`club_id`,`username`);--> statement-breakpoint
CREATE INDEX `members_club` ON `members` (`club_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`member_id` text NOT NULL,
	`amount` real NOT NULL,
	`period_start` text NOT NULL,
	`date` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`recorded_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`goal` text NOT NULL,
	`level` text NOT NULL,
	`program_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_account` ON `sessions` (`account_id`);--> statement-breakpoint
CREATE TABLE `workout_logs` (
	`member_id` text NOT NULL,
	`club_id` text NOT NULL,
	`week` text NOT NULL,
	`day` integer NOT NULL,
	`exercise_id` text NOT NULL,
	`round` integer NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`done` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`member_id`, `week`, `day`, `exercise_id`, `round`)
);
--> statement-breakpoint
CREATE INDEX `logs_club_week` ON `workout_logs` (`club_id`,`week`);