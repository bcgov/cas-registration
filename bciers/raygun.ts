/**
 * Raygun server-side wrapper module for Next.js.
 *
 * This follows the Raygun documentation pattern for server-side crash reporting.
 * This wrapper module allows Next.js to only bundle this code when used on the server.
 *
 * Place this file at the project root as recommended by Raygun docs.
 * https://raygun.com/documentation/language-guides/nodejs/crash-reporting/installation/
 *
 * IMPORTANT: This module should ONLY be imported server-side (in API routes, server actions, etc.)
 * Never import this in client components as it uses Node.js-only modules.
 */

// Prevent this module from being imported on the client-side
if (typeof window !== "undefined") {
  throw new Error(
    "raygun.ts can only be imported server-side. Use sendErrorToRaygun from @bciers/sentryConfig/raygun for client-side errors.",
  );
}

let raygunClient: any = null;

/**
 * Get or initialize the Raygun client (lazy initialization).
 * This ensures the raygun package is only loaded when actually needed.
 */
function getRaygunClient() {
  if (raygunClient !== null) {
    return raygunClient;
  }

  // Only initialize on server-side
  if (typeof window !== "undefined") {
    return null;
  }

  const raygunApiKey = process.env.NEXT_PUBLIC_RAYGUN_API_KEY;
  if (!raygunApiKey) {
    raygunClient = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Raygun = require("raygun");
    raygunClient = new Raygun.Client().init({
      batch: true,
      apiKey: raygunApiKey,
    });
  } catch (e) {
    console.error("Failed to initialize Raygun:", e);
    raygunClient = null;
  }

  return raygunClient;
}

// Export for backwards compatibility, but it will be null on client-side
export const raygun = getRaygunClient();

/**
 * Helper function to send errors to Raygun from server-side code.
 * This is a convenience wrapper around the raygun client.
 *
 * Raygun.send() signature: send(error, customData, callback)
 * - error: Error object
 * - customData: Object with custom data (tags can be included here)
 * - callback: Optional callback with response
 */
export function sendToRaygun(
  error: Error,
  customData?: Record<string, unknown>,
  tags?: string[],
) {
  const client = getRaygunClient();
  if (!client) {
    return;
  }

  const data: Record<string, unknown> = {
    ...(customData || {}),
  };

  // Add tags to customData if provided
  if (tags && tags.length > 0) {
    data.tags = tags;
  }

  client.send(error, data, (response: { statusCode: number }) => {
    if (response.statusCode !== 202) {
      console.error(`Failed to send error to Raygun: ${response.statusCode}`);
    }
  });
}
