import { pgTable, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const interviews = pgTable("interviews", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  callId: text("call_id").notNull().unique(),
  participantId: text("participant_id"),
  transcript: jsonb("transcript").$type<Array<{
    role: "agent" | "user";
    content: string;
    timestamp?: number;
  }>>().notNull().default([]),
  duration: integer("duration").notNull().default(0), // in seconds
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
