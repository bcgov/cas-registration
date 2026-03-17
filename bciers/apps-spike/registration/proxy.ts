import { stackProxies, withAuthorization } from "@bciers/proxies";
import { withRulesAppliedReg } from "@/registration/proxies/withRulesAppliedReg";
import { withResponseReg } from "@/registration/proxies/withResponseReg";
export const appName = "registration";
/* 📌
Proxy (formerly Middleware) allows you to run code before a request is completed so you can modify the response by
rewriting, redirecting, modifying the request or response headers, or responding directly.

In Next.js 16, middleware has been renamed to proxy and now runs in the Node.js runtime (instead of Edge runtime),
providing full access to Node.js APIs.
*/

export const config = {
  matcher: ["/", "/((?!api|_next|sw.js|favicon.ico).*)"],
};
// ⛓️ Chaining proxy functions for maintainability, and scalability by apply a series of task specific functions to a request
export default stackProxies([
  withAuthorization,
  withRulesAppliedReg,
  withResponseReg,
]);
