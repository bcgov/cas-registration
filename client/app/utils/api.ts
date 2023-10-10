/**
📚 Common fetch utility function to handle API requests and error catching
*/

// Define a common function to make API requests
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {},
  latency: number = 0 // Default latency is 0 milliseconds
) {
  try {
    // Simulate latency
    if (latency > 0) await new Promise((r) => setTimeout(r, latency));

    const defaultOptions: RequestInit = {
      cache: "no-store", // Default cache option
    };

    const mergedOptions: RequestInit = {
      ...defaultOptions,
      ...options, // Merge the provided options, allowing cache to be overridden
    };

    const response = await fetch(
      `${process.env.API_URL}${endpoint}`,
      mergedOptions
    );

    if (!response.ok) {
      // Handle HTTP errors, e.g., response.status is not in the 200-299 range
      return { error: `HTTP error! Status: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    // Handle any errors, including network issues
    if (error instanceof Error) {
      console.error(`An error occurred while fetching ${endpoint}:`, error);
      return {
        error: `An error occurred while fetching ${endpoint}: ${error.message}`,
      };
    } else {
      console.error(`An unknown error occurred while fetching ${endpoint}`);
      return {
        error: `An unknown error occurred while fetching ${endpoint}`,
      };
    }
  }
}
