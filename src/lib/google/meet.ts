import { buildMeetUrl } from "@/lib/scheduling/slots";

type MeetResult = {
  meetingUrl: string;
  calendarEventId?: string;
};

/**
 * Creates a Meet link. Uses Google Calendar API when service account env is set;
 * otherwise falls back to a stable placeholder URL per appointment.
 */
export async function createClassMeetLink(
  appointmentId: string,
  input: {
    teacherEmail: string;
    familyEmail: string;
    startsAt: Date;
    endsAt: Date;
    summary: string;
  },
): Promise<MeetResult> {
  const fallback = buildMeetUrl(appointmentId);

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!keyJson || !calendarId) {
    return { meetingUrl: fallback };
  }

  try {
    const credentials = JSON.parse(keyJson) as {
      client_email: string;
      private_key: string;
    };

    const { google } = await import("googleapis");
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });
    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: input.summary,
        start: { dateTime: input.startsAt.toISOString() },
        end: { dateTime: input.endsAt.toISOString() },
        attendees: [
          { email: input.teacherEmail },
          { email: input.familyEmail },
        ],
        conferenceData: {
          createRequest: {
            requestId: appointmentId.replace(/-/g, "").slice(0, 32),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const meet =
      event.data.hangoutLink ??
      event.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")
        ?.uri;

    return {
      meetingUrl: meet ?? fallback,
      calendarEventId: event.data.id ?? undefined,
    };
  } catch (error) {
    console.error("[meet] Calendar API failed, using placeholder:", error);
    return { meetingUrl: fallback };
  }
}

export function meetIntegrationConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_CALENDAR_ID,
  );
}
