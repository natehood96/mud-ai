CREATE TABLE "CharacterConversationLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"speaking_character_id" uuid NOT NULL,
	"target_character_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SystemDialogueLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"player_character_id" uuid NOT NULL,
	"is_input" boolean NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "CharacterConversationLog" ADD CONSTRAINT "CharacterConversationLog_world_id_World_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CharacterConversationLog" ADD CONSTRAINT "CharacterConversationLog_speaking_character_id_Character_id_fk" FOREIGN KEY ("speaking_character_id") REFERENCES "public"."Character"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CharacterConversationLog" ADD CONSTRAINT "CharacterConversationLog_target_character_id_Character_id_fk" FOREIGN KEY ("target_character_id") REFERENCES "public"."Character"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SystemDialogueLog" ADD CONSTRAINT "SystemDialogueLog_world_id_World_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SystemDialogueLog" ADD CONSTRAINT "SystemDialogueLog_player_character_id_Character_id_fk" FOREIGN KEY ("player_character_id") REFERENCES "public"."Character"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_character_convo_pair_time" ON "CharacterConversationLog" USING btree ("speaking_character_id","target_character_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_system_dialog_player_time" ON "SystemDialogueLog" USING btree ("player_character_id","created_at");