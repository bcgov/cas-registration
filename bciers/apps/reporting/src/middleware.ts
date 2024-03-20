// eslint-disable-next-line
import { stackMiddlewares } from '@/middlewares/stackMiddlewares';
import { withReportingAuthorization } from './middlewares/withReportingAuthorization';

// This needed copy-pasting because next tries to parse this file differentely somehow
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
    '/((?!static|.*\\..*|_next).*)', //matcher solution for public assets, url.extension, _next exclusion:
  ],
};

export default stackMiddlewares([withReportingAuthorization]);
