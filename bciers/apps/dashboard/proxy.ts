import { stackProxies } from "@bciers/proxies";
import { withTokenRefreshProxy } from "@/dashboard/proxies/withTokenRefresh";
import { withAuthorizationDashboard } from "@/dashboard/proxies/withAuthorizationDashboard";
import {
  isCIEnvironment,
  isVitestEnvironment,
  isPlaywrightEnvironment,
} from "@bciers/utils/src/environmentDetection";

/* 📌
Proxy (formerly Middleware) allows you to run code before a request is completed so you can modify the response by
rewriting, redirecting, modifying the request or response headers, or responding directly.

In Next.js 16, middleware has been renamed to proxy and now runs in the Node.js runtime (instead of Edge runtime),
providing full access to Node.js APIs.
*/
/*
Proxy execution order:
headers from next.config.js
redirects from next.config.js
Proxy (rewrites, redirects, etc.)
beforeFiles (rewrites) from next.config.js
Filesystem routes (public/, _next/static/, Pages, etc.)
afterFiles (rewrites) from next.config.js
Dynamic Routes (/blog/[slug])
fallback (rewrites) from next.config.js
*/

/*🤝
There are two ways to define which paths Proxy will run on:
Custom matcher config
Conditional statements
*/

export const config = {
  matcher: ["/((?!static|.*\\..*|api|_next|sw.js|favicon.ico|bciers/libs/).*)"],
};

// ⛓️ Chaining proxy functions for maintainability, and scalability by apply a series of task specific functions to a request
export default stackProxies([
  withAuthorizationDashboard,
  // Bypass if running in CI, Vitest, or Playwright e2e test environments
  ...(isCIEnvironment() || isVitestEnvironment() || isPlaywrightEnvironment()
    ? []
    : [withTokenRefreshProxy]),
]);
