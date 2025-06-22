CREATE TABLE "note_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"s3_key" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note_images" ADD CONSTRAINT "note_images_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "note_images_note_id_idx" ON "note_images" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "note_images_s3_key_idx" ON "note_images" USING btree ("s3_key");