CREATE TABLE `records` (
	`kind` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`kind`, `key`)
);
