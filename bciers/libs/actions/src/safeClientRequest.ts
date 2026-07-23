import { actionHandler } from "@bciers/actions";

export type SafeAsyncResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Safely executes a client-side asynchronous request.
 * Catches any raw HTTP errors or network exceptions and formats them as a stable tuple
 * to prevent client-side UI crashes.
 */
export async function safeClientRequest<T = any>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  pathToRevalidate: string = "",
  options?: RequestInit,
): Promise<SafeAsyncResponse<T>> {
  try {
    const response = await actionHandler(
      path,
      method,
      pathToRevalidate,
      options,
    );

    // If actionHandler returned an expected backend validation/error dictionary
    if (response?.error) {
      return { data: null, error: response.error };
    }

    return { data: response as T, error: null };
  } catch (err: any) {
    return {
      data: null,
      error:
        err?.message || "A network or system error occurred. Please try again.",
    };
  }
}
