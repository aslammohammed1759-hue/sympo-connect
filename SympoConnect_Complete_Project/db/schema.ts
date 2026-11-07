import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const registrations = pgTable(
  "registrations",
  {
    id: serial().primaryKey(),
    eventId: text("event_id").notNull(),
    eventTitle: text("event_title").notNull(),
    participantName: text("participant_name").notNull(),
    email: text().notNull(),
    phone: text(),
    college: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("registrations_event_id_idx").on(t.eventId)]
);
