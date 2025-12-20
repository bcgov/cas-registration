import { NextProxy, NextResponse } from "next/server";
import { ProxyFactory } from "./types";

// 📚 Define a function for stacking proxies
export function stackProxies(
  functions: ProxyFactory[] = [], // An array of proxy factory functions
  index = 0, // Initial index to start with the first proxy
): NextProxy {
  const current = functions[index]; // Get the current proxy factory function

  // 🔍 Check if there is a current proxy
  if (current) {
    const next = stackProxies(functions, index + 1); // Recursively get the next proxy
    return current(next); // Execute the current proxy with the next proxy as an argument
  }

  // ▶️ If there are no more proxies, return a proxy that calls NextResponse.next()
  return () => NextResponse.next();
}
