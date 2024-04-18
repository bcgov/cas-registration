import { stackMiddlewares } from "@/middlewares/stackMiddlewares";
import { withAuthorization } from "@/middlewares/withAuthorization";

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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    // Skip all internal paths (_next)
    // "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
    "/((?!static|.*\\..*|_next).*)", //matcher solution for public assets, url.extension, _next exclusion:
  ],
};

// ⛓️ Chaining middleware for maintainability, and scalability by apply a series of task specific functions to a request
export default stackMiddlewares([withAuthorization]);
