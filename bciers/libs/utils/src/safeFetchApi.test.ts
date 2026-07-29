import { describe, expect, it, vi, beforeEach } from "vitest";
import { safeFetchApi } from "@bciers/actions/safeFetchApi";
import { getToken } from "@bciers/actions";
import { fetchApi } from "@bciers/actions/api/fetchApi";

// Mock @bciers/actions dependencies
vi.mock("@bciers/actions", () => ({
  getToken: vi.fn(),
}));

vi.mock("@bciers/actions/api/fetchApi", () => ({
  fetchApi: vi.fn(),
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
const mockFetchApi = fetchApi as ReturnType<typeof vi.fn>;

describe("safeFetchApi function", () => {
  const fallbackValue = { fallback: true };
  const mockToken = { user_guid: "user-guid-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue(mockToken);
  });

  it("should return data on successful request", async () => {
    const mockData = { id: 1, name: "Test Entity" };
    mockFetchApi.mockResolvedValueOnce(mockData);

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(mockData);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it("should return fallback and forward to Sentry when fetchApi returns response.error or response.message", async () => {
    mockFetchApi.mockResolvedValueOnce({
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

  it("should return fallback and forward to Sentry when fetchApi throws an Error instance", async () => {
    const thrownError = new Error("Network timeout");
    mockFetchApi.mockRejectedValueOnce(thrownError);

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
    expect(captureExceptionMock).toHaveBeenCalledWith(
      thrownError,
      "user-guid-123",
    );
  });

  it("should handle non-Error thrown primitive values safely and convert them for Sentry", async () => {
    mockFetchApi.mockRejectedValueOnce("Server crashed completely");

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
    mockFetchApi.mockRejectedValueOnce(plainObjectError);

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
    mockFetchApi.mockRejectedValueOnce(networkError);

    // Force Sentry reporting itself to throw an exception
    captureExceptionMock.mockImplementationOnce(() => {
      throw new Error("Sentry server unreachable");
    });

    const result = await safeFetchApi("/endpoint", fallbackValue, "GET");

    expect(result).toEqual(fallbackValue);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
  });
});
