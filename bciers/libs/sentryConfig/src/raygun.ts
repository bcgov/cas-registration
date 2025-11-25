/**
 * Raygun error tracking configuration for Next.js.
 *
 * This module provides Raygun initialization following the official documentation.
 * POC for replacing Sentry with Raygun.
 */

declare global {
  interface Window {
    rg4js?: {
      (command: string, ...args: unknown[]): void;
      q?: Array<{ command: string; args: unknown[] }>;
    };
  }
}

/**
 * Get Raygun API key from environment variables.
 * Client-side uses NEXT_PUBLIC_ prefixed vars.
 */
function getRaygunApiKey(): string | undefined {
  if (typeof window !== "undefined") {
    // Client-side: try to get from window.__NEXT_DATA__ or globalThis
    try {
      return (
        (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_RAYGUN_API_KEY ||
        (globalThis as any).NEXT_PUBLIC_RAYGUN_API_KEY
      );
    } catch {
      return undefined;
    }
  }
  // Server-side - only accessible in Node.js environment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).process !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).process.env?.NEXT_PUBLIC_RAYGUN_API_KEY;
  }
  return undefined;
}

/**
 * Get Raygun environment from environment variables.
 */
function getRaygunEnvironment(): string | undefined {
  if (typeof window !== "undefined") {
    try {
      return (
        (window as any).__NEXT_DATA__?.env?.RAYGUN_ENVIRONMENT ||
        (globalThis as any).RAYGUN_ENVIRONMENT
      );
    } catch {
      return undefined;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).process !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).process.env?.RAYGUN_ENVIRONMENT;
  }
  return undefined;
}

/**
 * Get Raygun release version from environment variables.
 */
function getRaygunRelease(): string | undefined {
  if (typeof window !== "undefined") {
    try {
      return (
        (window as any).__NEXT_DATA__?.env?.RAYGUN_RELEASE ||
        (globalThis as any).RAYGUN_RELEASE
      );
    } catch {
      return undefined;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).process !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).process.env?.RAYGUN_RELEASE;
  }
  return undefined;
}

/**
 * Generate the Raygun script tag content for client-side initialization.
 * This follows the exact pattern from Raygun documentation for App Routing.
 */
export function getRaygunScriptContent(): string {
  const apiKey = getRaygunApiKey();
  const environment = getRaygunEnvironment();
  const release = getRaygunRelease();

  if (!apiKey) {
    return "";
  }

  // Use https protocol for CDN as recommended in docs
  const script = `
!function(a,b,c,d,e,f,g,h){a.RaygunObject=e,a[e]=a[e]||function(){
(a[e].o=a[e].o||[]).push(arguments)},f=b.createElement(c),g=b.getElementsByTagName(c)[0],
f.async=1,f.src=d,g.parentNode.insertBefore(f,g),h=a.onerror,a.onerror=function(b,c,d,f,g){
h&&h(b,c,d,f,g),g||(g=new Error(b)),a[e].q=a[e].q||[],a[e].q.push({
e:g})}}(window,document,"script","https://cdn.raygun.io/raygun4js/raygun.min.js","rg4js");

rg4js('apiKey', '${apiKey}');
rg4js('enableCrashReporting', true);
${release ? `rg4js('setVersion', '${release}');` : ""}
${environment ? `rg4js('options', { environment: '${environment}' });` : ""}
`;

  return script;
}

/**
 * Send an error to Raygun manually (client-side).
 * Useful for testing or custom error handling.
 */
export function sendErrorToRaygun(
  error: Error,
  tags?: string[],
  customData?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.rg4js) {
    return;
  }

  window.rg4js("send", {
    error,
    tags: tags || [],
    customData: customData || {},
  });
}

/**
 * Set user information in Raygun (client-side).
 * As per Raygun documentation for setting up customers.
 */
export function setRaygunUser(user: {
  identifier: string;
  isAnonymous?: boolean;
  email?: string;
  firstName?: string;
  fullName?: string;
}) {
  if (typeof window === "undefined" || !window.rg4js) {
    return;
  }

  window.rg4js("setUser", user);
}

/**
 * Send server-side error to Raygun.
 * Uses the raygun wrapper module at project root.
 *
 * IMPORTANT: This function should ONLY be called from server-side code
 * (API routes, server actions, getServerSideProps, etc.)
 * It will throw an error if called from client-side code.
 */
export async function sendServerErrorToRaygun(
  error: Error,
  appName: string,
  tags?: string[],
  customData?: Record<string, unknown>,
) {
  // Guard against client-side execution
  if (typeof window !== "undefined") {
    console.warn(
      "sendServerErrorToRaygun should only be called server-side. Use sendErrorToRaygun for client-side errors.",
    );
    return;
  }

  try {
    // Dynamic import to ensure it's only loaded server-side
    // From libs/sentryConfig/src/raygun.ts, go up 3 levels to reach project root
    // Use a function import to prevent Next.js from analyzing the module during build
    const raygunModule = await import("../../../raygun");

    if (!raygunModule || !raygunModule.sendToRaygun) {
      return;
    }

    raygunModule.sendToRaygun(
      error,
      {
        app: appName,
        ...customData,
      },
      tags,
    );
  } catch (e) {
    // Don't let Raygun errors break the application
    // If it's the "server-only" error, that's expected on client-side
    if (e instanceof Error && e.message.includes("server-side")) {
      return;
    }
    console.error(`Error sending to Raygun: ${e}`);
  }
}
