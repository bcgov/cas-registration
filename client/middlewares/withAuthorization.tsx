import { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";

import { MiddlewareFactory } from "./types";

export const withAuthorization: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    /*TODO
     *
     * AUTHENTICATION
     */

    //👌 ok: route to next middleware
    return next(request, _next);
  };
};
