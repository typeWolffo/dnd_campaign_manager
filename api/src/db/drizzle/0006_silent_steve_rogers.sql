ALTER TABLE "api_tokens" ALTER COLUMN "last_used_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "api_tokens" ALTER COLUMN "expires_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "expires_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "updated_at" SET NOT NULL;