CREATE TABLE "CharacterInventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Character" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"node_id" uuid NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"z" integer DEFAULT 0 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "Item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "NodeConnection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"node_a" uuid NOT NULL,
	"node_b" uuid NOT NULL,
	"dx" integer NOT NULL,
	"dy" integer NOT NULL,
	"dz" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Node" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"name" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"terrain" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "WorldAdmin" (
	"world_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "WorldAdmin_world_id_user_id_pk" PRIMARY KEY("world_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "World" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_played_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "CharacterInventory" ADD CONSTRAINT "CharacterInventory_character_id_Character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."Character"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CharacterInventory" ADD CONSTRAINT "CharacterInventory_item_id_Item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."Item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Character" ADD CONSTRAINT "Character_world_id_World_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Character" ADD CONSTRAINT "Character_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Character" ADD CONSTRAINT "Character_node_id_Node_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."Node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_world_id_World_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_node_a_Node_id_fk" FOREIGN KEY ("node_a") REFERENCES "public"."Node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_node_b_Node_id_fk" FOREIGN KEY ("node_b") REFERENCES "public"."Node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Node" ADD CONSTRAINT "Node_world_id_World_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorldAdmin" ADD CONSTRAINT "WorldAdmin_world_id_World_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."World"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorldAdmin" ADD CONSTRAINT "WorldAdmin_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;