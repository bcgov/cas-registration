import { stackMiddlewares } from "@bciers/middlewares";
import { withAuthorizationCompliance } from "./middlewares/withAuthorizationCompliance";

/* 📌
Middleware allows you to run code before a request is completed so you can modify the response by
rewriting, redirecting, modifying the request or response headers, or responding directly.
*/
/*
Middleware execution order:
headers from next.config.js
redirects from next.config.js
Middleware (rewrites, redirects, etc.)
beforeFiles (rewrites) from next.config.js
Filesystem routes (public/, _next/static/, Pages, etc.)
afterFiles (rewrites) from next.config.js
Dynamic Routes (/blog/[slug])
fallback (rewrites) from next.config.js
*/

/*🤝
There are two ways to define which paths Middleware will run on:
Custom matcher config
Conditional statements
*/
export const config = {
  matcher: [
    "/((?!static|.*\\..*|api|_next|sw.js|favicon.ico|bciers/libs/shared/).*)",
  ],
};

// ⛓️ Chaining middleware for maintainability, and scalability by apply a series of task specific functions to a request
export default stackMiddlewares([withAuthorizationCompliance]);
