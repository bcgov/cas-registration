// 🛠️ Function to get the last non-empty segment as a UUID from an endpoint URL
function getUUIDFromEndpoint(endpoint: string): string | null {
  // Split the endpoint URL by '/'
  const segments = endpoint.split("/");

  // Filter out empty segments
  const nonEmptySegments = segments.filter((segment) => segment.trim() !== "");

  // Find the last non-empty segment
  const lastSegment: string | null =
    nonEmptySegments.length > 0
      ? nonEmptySegments[nonEmptySegments.length - 1]
      : null;

  // Validate if the last segment is a UUID (a more permissive pattern)
  const isUUID = /^[0-9a-fA-F]{32}$/.test(lastSegment as string);

  // Return the last non-empty segment as a UUID or null if not a UUID
  return isUUID ? (lastSegment as string) : null;
}

export default getUUIDFromEndpoint;
