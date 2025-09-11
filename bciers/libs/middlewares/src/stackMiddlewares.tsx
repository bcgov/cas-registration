import { NextMiddleware, NextResponse } from "next/server";
import { MiddlewareFactory } from "./types";

console.log("stackMiddlewares");

// 📚 Define a function for stacking middlewares
export function stackMiddlewares(
  functions: MiddlewareFactory[] = [], // An array of middleware factory functions
  index = 0, // Initial index to start with the first middleware
): NextMiddleware {
  const current = functions[index]; // Get the current middleware factory function

  // 🔍 Check if there is a current middleware
  if (current) {
    const next = stackMiddlewares(functions, index + 1); // Recursively get the next middleware
    return current(next); // Execute the current middleware with the next middleware as an argument
  }

  // ▶️ If there are no more middlewares, return a middleware that calls NextResponse.next()
  return () => NextResponse.next();
}
