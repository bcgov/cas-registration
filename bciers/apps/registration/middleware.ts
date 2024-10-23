import { stackMiddlewares, withAuthorization } from "@bciers/middlewares";
import { withRulesAppliedReg } from "./middlewares/withRulesAppliedReg";
import { withResponseReg } from "./middlewares/withResponseReg";
export const appName = "registration";
/* 📌
Middleware allows you to run code before a request is completed so you can modify the response by
rewriting, redirecting, modifying the request or response headers, or responding directly.
*/

//export const config = { matcher: ["/((?!api|_next|sw.js|favicon.ico).*)"] };
export const config = {
  matcher: ["/", "/((?!api|_next|sw.js|favicon.ico).*)"],
};
// ⛓️ Chaining middleware for maintainability, and scalability by apply a series of task specific functions to a request
export default stackMiddlewares([
  withAuthorization,
  withRulesAppliedReg,
  withResponseReg,
]);
