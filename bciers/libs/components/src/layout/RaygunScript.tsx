/**
 * Raygun script component for Next.js App Routing.
 *
 * This component inserts the Raygun script directly into the <head> tag
 * as per Raygun documentation for Next.js App Routing.
 */
import { getRaygunScriptContent } from "@bciers/sentryConfig/raygun";

export default function RaygunScript() {
  const scriptContent = getRaygunScriptContent();

  if (!scriptContent) {
    return null;
  }

  return (
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: scriptContent,
      }}
    />
  );
}
