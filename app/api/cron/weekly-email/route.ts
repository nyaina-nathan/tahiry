import { scheduleWeeklyEmails } from "@/services/weekly-email.service";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await scheduleWeeklyEmails();

    return Response.json(result);
  } catch (error) {
    console.error("Weekly email cron failed", error);

    return Response.json(
      { error: "Unable to schedule weekly emails." },
      { status: 500 },
    );
  }
}
