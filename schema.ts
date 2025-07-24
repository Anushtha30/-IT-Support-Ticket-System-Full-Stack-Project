import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // 'student', 'faculty', 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  issueType: varchar("issue_type").notNull(), // 'hardware', 'software', 'network', etc.
  priority: varchar("priority").notNull(), // 'low', 'medium', 'high', 'critical'
  status: varchar("status").notNull().default("new"), // 'new', 'in-progress', 'resolved', 'closed'
  location: text("location"),
  submitterId: varchar("submitter_id").notNull().references(() => users.id),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket comments table
export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").notNull().default(false), // true for internal IT staff comments
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  submittedTickets: many(tickets, { relationName: "submitter" }),
  assignedTickets: many(tickets, { relationName: "assignee" }),
  comments: many(ticketComments),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  submitter: one(users, {
    fields: [tickets.submitterId],
    references: [users.id],
    relationName: "submitter",
  }),
  assignee: one(users, {
    fields: [tickets.assignedToId],
    references: [users.id],
    relationName: "assignee",
  }),
  comments: many(ticketComments),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});

export const updateTicketSchema = createInsertSchema(tickets)
  .omit({
    id: true,
    createdAt: true,
    submitterId: true,
  })
  .partial();

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type TicketWithSubmitter = Ticket & { submitter: User; assignee?: User };
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof ticketComments.$inferSelect;
export type CommentWithUser = Comment & { user: User };
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
