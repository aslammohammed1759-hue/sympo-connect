CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY,
	"event_id" text NOT NULL,
	"event_title" text NOT NULL,
	"participant_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"college" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "registrations_event_id_idx" ON "registrations" ("event_id");