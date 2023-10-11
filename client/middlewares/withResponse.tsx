import { NextResponse } from "next/server";

import { MiddlewareFactory } from "./types";

// 👇️ return request's response
export const withResponse: MiddlewareFactory = () => {
  return async () => {
    // 👇️ create response
    let response = NextResponse.next();

    /**
     * response modifications go here
     */

    return response;
  };
};
