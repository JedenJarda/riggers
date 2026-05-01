import { NextResponse } from "next/server";
import { Resend } from "resend";

// Sandbox default — works without domain verification, but Resend will
// only deliver to the email registered on this Resend account. Once the
// `riggers.cz` domain is verified in Resend, set BOOKING_FROM_ADDRESS to
// `Riggers Booking <booking@riggers.cz>` and BOOKING_TO_ADDRESS to
// `booking@riggers.cz`. Both are env vars so swapping them is a Vercel
// dashboard change, no redeploy of code.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.BOOKING_FROM_ADDRESS ?? "Riggers Booking <onboarding@resend.dev>";
const TO = process.env.BOOKING_TO_ADDRESS ?? "jaroslavstuchlik7@gmail.com";

type Payload = {
  dates?: string[];
  venue?: string;
  eventType?: string;
  email?: string;
  phone?: string;
  note?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  if (!RESEND_API_KEY) {
    console.error("[book] RESEND_API_KEY missing");
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!Array.isArray(body.dates) || body.dates.length === 0) {
    return NextResponse.json({ ok: false, error: "no_dates" }, { status: 400 });
  }

  const dates = body.dates.slice().sort().join(", ");
  const venue = body.venue?.trim() || "(not specified)";
  const eventType = body.eventType?.trim() || "(not specified)";
  const phone = body.phone?.trim() || "(not provided)";
  const note = body.note?.trim() || "(none)";
  const dayWord = body.dates.length === 1 ? "day" : "days";

  const subject = `New booking — ${venue} (${body.dates.length} ${dayWord})`;

  const rows: [string, string][] = [
    ["Dates", dates],
    ["Venue", venue],
    ["Event type", eventType],
    ["Email", email],
    ["Phone", phone],
  ];

  const html = `
<div style="font-family:-apple-system,system-ui,sans-serif;max-width:560px;color:#0a0a0a;line-height:1.5;">
  <h2 style="margin:0 0 16px;font-weight:600;">New booking request</h2>
  <table style="width:100%;border-collapse:collapse;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 0;color:#666;width:120px;vertical-align:top;">${k}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}
    <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Note</td><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(note)}</td></tr>
  </table>
  <p style="margin-top:24px;color:#888;font-size:13px;">Reply directly to this email to reach the customer.</p>
</div>`;

  const text = [
    "New booking request",
    "",
    `Dates:      ${dates}`,
    `Venue:      ${venue}`,
    `Event type: ${eventType}`,
    `Email:      ${email}`,
    `Phone:      ${phone}`,
    "",
    "Note:",
    note,
  ].join("\n");

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[book] resend error", error);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[book] exception", err);
    return NextResponse.json({ ok: false, error: "exception" }, { status: 500 });
  }
}
