import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { registrations } from "../../db/schema.js";
import { events } from "../../src/events.js";

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const event = events.find((e) => e.id === body.event_id);
  const participantName = clean(body.participant_name, 100);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 30);
  const college = clean(body.college, 150);

  if (!event) return Response.json({ error: "Please choose a valid event." }, { status: 400 });
  if (participantName.length < 2) return Response.json({ error: "Please enter your full name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });

  try {
    const [row] = await db
      .insert(registrations)
      .values({
        eventId: event.id,
        eventTitle: event.title,
        participantName,
        email,
        phone: phone || null,
        college: college || null,
      })
      .returning({ id: registrations.id });
    return Response.json({ id: row.id }, { status: 201 });
  } catch (err) {
    console.error("Registration insert failed:", err);
    return Response.json({ error: "Could not save your registration. Please try again." }, { status: 500 });
  }
};

export const config: Config = { path: "/api/register" };
