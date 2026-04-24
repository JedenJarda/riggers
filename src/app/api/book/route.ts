import { NextResponse } from "next/server";

/**
 * Booking submission endpoint. Currently a mock — logs the payload
 * and returns 200. Swap in Resend (or any transactional mailer) once
 * the sending domain is verified.
 *
 * Expected payload: { dates: string[], venue, eventType?, email,
 * phone?, note? }. All validation sits client-side for now; add
 * Zod here before go-live.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // TODO: replace with `await resend.emails.send(...)` once the
    //       sending domain is verified in Resend.
    // eslint-disable-next-line no-console
    console.log("[book] new submission", {
      dates: Array.isArray(body?.dates) ? body.dates.length : 0,
      venue: body?.venue,
      email: body?.email,
    });

    // Simulated latency so the loading state is visible in dev.
    await new Promise((r) => setTimeout(r, 500));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
