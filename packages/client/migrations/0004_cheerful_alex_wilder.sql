CREATE TABLE "collab_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(150) NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ydoc_state" "bytea" NOT NULL,
	"collaborators" jsonb DEFAULT '[]' NOT NULL,
	"room_id" varchar(100) NOT NULL,
	CONSTRAINT "collab_notes_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
ALTER TABLE "collab_notes" ADD CONSTRAINT "collab_notes_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;