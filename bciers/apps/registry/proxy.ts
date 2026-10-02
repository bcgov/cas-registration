import { stackProxies, withAuthorization } from "@bciers/proxies";
import { withInternalRegistryAccess } from "@/registry/proxies/withInternalRegistryAccess";

export const config = {
  matcher: ["/((?!api|_next|sw.js|favicon.ico).*)"],
};

export default stackProxies([withAuthorization, withInternalRegistryAccess]);
