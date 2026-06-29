export const maxDuration = 180;

function getApiCandidates(): string[] {
  const configured = process.env.API_URL ?? "";
  const candidates: string[] = [];

  if (configured) {
    candidates.push(configured);
    // In local containerized setups, localhost from the frontend container
    // may not resolve to the backend service. Try host.docker.internal too.
    if (configured.includes("127.0.0.1") || configured.includes("localhost")) {
      candidates.push(configured.replace("127.0.0.1", "host.docker.internal"));
      candidates.push(configured.replace("localhost", "host.docker.internal"));
    }
  }

  if (!candidates.length) {
    candidates.push("http://host.docker.internal:8000/");
    candidates.push("http://127.0.0.1:8000/");
  }

  return [...new Set(candidates)];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const attachmentPath =
      typeof body?.attachment_path === "string"
        ? body.attachment_path
        : undefined;

    const cookieHeader = request.headers.get("cookie") ?? "";
    const tokenResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/token`,
      {
        method: "POST",
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      },
    );

    if (!tokenResponse.ok) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenRaw = await tokenResponse.text();
    let token: any = {};
    if (tokenRaw) {
      try {
        token = JSON.parse(tokenRaw);
      } catch {
        return Response.json(
          { message: "Unable to parse auth token response" },
          { status: 502 },
        );
      }
    }
    const userGuid = token?.user_guid || "";

    if (!userGuid) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    let lastFetchError: unknown = null;
    for (const apiBase of getApiCandidates()) {
      try {
        console.log(
          `[llm-chat] Attempting fetch from ${apiBase}reporting/llm-chat`,
        );
        const apiResponse = await fetch(`${apiBase}reporting/llm-chat`, {
          method: "POST",
          cache: "no-store",
          headers: {
            Authorization: JSON.stringify({ user_guid: userGuid }),
          },
          body: JSON.stringify({
            prompt,
            attachment_path: attachmentPath,
          }),
        });

        const rawBody = await apiResponse.text();
        console.log(
          `[llm-chat] Response received: status=${apiResponse.status}, bodyLen=${rawBody.length}`,
        );
        let apiPayload: unknown = rawBody;
        if (rawBody) {
          try {
            apiPayload = JSON.parse(rawBody);
          } catch {
            console.log(
              "[llm-chat] Response body was not JSON, keeping raw text",
            );
            // Keep raw text payload if backend didn't return JSON.
          }
        }

        if (!apiResponse.ok) {
          console.log(
            "[llm-chat] Backend returned error status",
            apiResponse.status,
          );
          if (
            typeof apiPayload === "object" &&
            apiPayload &&
            "message" in apiPayload
          ) {
            return Response.json(apiPayload, { status: apiResponse.status });
          }
          return Response.json(
            {
              message:
                typeof apiPayload === "string" && apiPayload
                  ? apiPayload
                  : `HTTP error! Status: ${apiResponse.status}`,
            },
            { status: apiResponse.status },
          );
        }

        console.log("[llm-chat] Backend returned success");
        return Response.json(apiPayload, { status: apiResponse.status });
      } catch (error) {
        console.log(
          `[llm-chat] Fetch failed from ${apiBase}: ${String(error)}`,
        );
        lastFetchError = error;
      }
    }

    console.log(
      `[llm-chat] All candidates failed. Last error: ${String(lastFetchError)}`,
    );
    return Response.json(
      {
        message: `Unable to reach backend API from reporting app route. ${String(
          lastFetchError,
        )}`,
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("[llm-chat] Unhandled error in route:", error);
    return Response.json(
      {
        message: `An unknown error occurred while calling llm-chat: ${String(
          error,
        )}`,
      },
      { status: 500 },
    );
  }
}
