import { describe, expect, it, vi, beforeEach } from "vitest";
import { safeFetchApi } from "@bciers/actions/api/safeFetchApi";
import { getToken } from "@bciers/actions";

// Mock @bciers/actions dependencies
vi.mock("@bciers/actions", () => ({
  getToken: vi.fn(),
}));

// Mock Sentry using vi.hoisted to reference captureExceptionMock inside vi.mock factory
const { captureExceptionMock } = vi.hoisted(() => {
  return {
    captureExceptionMock: vi.fn(),
  };
});

vi.mock("@bciers/sentryConfig/sentry", () => ({
  captureException: captureExceptionMock,
}));

const mockGetToken = getToken as ReturnType<typeof vi.fn>;

// Helper to mock global fetch responses
function mockFetchResponse(data: any, status = 200, ok = true) {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? "OK" : "Internal Server Error",
    json: async () => data,
  } as Response);
}

describe("safeFetchApi function", () => {
  const fallbackValue = { fallback: true };
  const mockToken = { user_guid: "user-guid-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue(mockToken);
  });

  it("should return data on successful request", async () => {
    const mockData = { id: 1, name: "Test Entity" };
    mockFetchResponse(mockData);

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(mockData);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it("should return fallback and log to Sentry when HTTP response is not ok", async () => {
    mockFetchResponse({}, 500, false);

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "❗ Failed HTTP fetch /endpoint: Internal Server Error",
      }),
      "user-guid-123",
    );
  });

  it("should return fallback and forward to Sentry when response contains error or message property", async () => {
    mockFetchResponse({
      error: "Backend error message",
    });

    const result = await safeFetchApi("/endpoint", fallbackValue, "POST");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "[API Error] /endpoint: Backend error message",
      }),
      "user-guid-123",
    );
  });

  it("should return fallback and forward to Sentry when fetch throws an Error instance", async () => {
    const thrownError = new Error("Network timeout");
    global.fetch = vi.fn().mockRejectedValueOnce(thrownError);

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      thrownError,
      "user-guid-123",
    );
  });

  it("should handle non-Error thrown primitive values safely and convert them for Sentry", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce("Server crashed completely");

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Server crashed completely",
      }),
      "user-guid-123",
    );
  });

  it("should handle non-Error thrown plain objects by stringifying them for Sentry", async () => {
    const plainObjectError = { status: 500, detail: "Internal Server Error" };
    global.fetch = vi.fn().mockRejectedValueOnce(plainObjectError);

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: JSON.stringify(plainObjectError),
      }),
      "user-guid-123",
    );
  });

  it("should fail silently and still return fallback if captureException throws", async () => {
    const networkError = new Error("Connection failed");
    global.fetch = vi.fn().mockRejectedValueOnce(networkError);

    // Force Sentry reporting itself to throw an exception
    captureExceptionMock.mockImplementationOnce(() => {
      throw new Error("Sentry server unreachable");
    });

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
  });
});
