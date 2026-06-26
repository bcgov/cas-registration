import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@bciers/actions";

export async function POST(request: NextRequest) {
  const token = await getToken();
  const userGuid = token?.user_guid ?? "";

  const formData = await request.formData();

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "API_URL is not configured" }, { status: 500 });
  }

  const upstream = await fetch(
    `${apiUrl}reporting/verification-statement-analysis-stream`,
    {
      method: "POST",
      headers: {
        Authorization: JSON.stringify({ user_guid: userGuid }),
      },
      body: formData,
    },
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream error: ${upstream.status}` },
      { status: upstream.status },
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
