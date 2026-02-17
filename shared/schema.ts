import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We're using in-memory storage as requested, but we define the shape here for types
// Verification codes generated for users
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  isUsed: boolean("is_used").default(false),
  expiresAt: integer("expires_at").notNull(), // Unix timestamp
  cycleId: text("cycle_id").notNull(), // To track global resets
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({ 
  id: true, 
  isUsed: true 
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;

// Global cycle state
export interface GlobalCycle {
  id: string;
  expiresAt: number;
}

// API Response types
export interface CodeResponse {
  code: string;
  expiresIn: number; // Seconds remaining
  expiresAt: number; // Timestamp
}

export interface VerifyRequest {
  code: string;
  discordId: string;
}
