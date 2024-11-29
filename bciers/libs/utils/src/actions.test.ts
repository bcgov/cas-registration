import { describe, expect } from "vitest";
import { actionHandler } from "@bciers/actions";
import { getToken } from "@bciers/actions";
import { fetch } from "@bciers/testConfig/mocks";
import * as Sentry from "@sentry/nextjs";

// disable the global mock since we are testing actions here
vi.unmock("@bciers/actions");

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    toString: vi.fn(() => "cookie"),
  })),
}));

const consoleMock = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

const sentryMock = vi
  .spyOn(Sentry, "captureException")
  .mockImplementation(() => "Sentry captureException called");

const responseToken = {
  name: "User, Test",
  email: "test.user@gov.bc.ca",
  sub: "ba2ba62a121842e0942aab9e92ce8822@idir",
  given_name: "Test",
  family_name: "User",
  user_guid: "ba2ba62a121842e0942aab9e92ce8822",
  identity_provider: "idir",
  full_name: "Test User",
  app_role: "cas_admin",
  jti: "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
};

// Mock the response for the getToken function
const mockTokenResponse200 = () => {
  fetch.mockResponseOnce(JSON.stringify(responseToken), {
    status: 200,
  });
};

describe("getToken function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the token", async () => {
    mockTokenResponse200();
    const result = await getToken();

    expect(result).toEqual(responseToken);
  });

  it("should return an error if the fetch throws an error", async () => {
    fetch.mockReject(new Error("Fetch failed"));
    const result = await getToken();

    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "An error occurred while fetching token: Error: Fetch failed",
    );

    expect(result).toEqual({});
  });

  it("should return an error if the fetch response is not ok", async () => {
    fetch.mockResponse(JSON.stringify({ message: "Error message" }), {
      status: 400,
    });
    const result = await getToken();

    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "Failed to fetch token. Status: 400",
    );

    expect(result).toEqual({});
  });
});

describe("actionHandler function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the data", async () => {
    fetch.mockResponses(
      // getToken fetch
      [JSON.stringify(responseToken), { status: 200 }],
      // actionHandler fetch
      [JSON.stringify({ test_response: "test" }), { status: 200 }],
    );

    const result = await actionHandler("/endpoint", "GET");

    expect(result).toEqual({ test_response: "test" });
  });

  it("should return an error if the fetch throws an error", async () => {
    mockTokenResponse200();
    fetch.mockReject(new Error("Fetch failed"));
    const result = await actionHandler("/endpoint", "GET");

    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "An error occurred while fetching /endpoint:",
      expect.any(Error),
    );

    expect(result).toEqual({
      error: "An error occurred while fetching /endpoint: Fetch failed",
    });
  });

  it("can still return data from an allowed v1 endpoint if fetching token fails", async () => {
    // Note: this would still likely fail in a real-world scenario if no uuid was in the endpoint url which is grabbed by the getUUIDFromEndpoint function since our API requires a user_guid in the Authorization header
    fetch.mockResponses(
      // getToken fetch
      [JSON.stringify({ message: "Error message" }), { status: 400 }],
      // actionHandler fetch
      [JSON.stringify({ test_data: "test" }), { status: 200 }],
    );

    const result = await actionHandler(
      "registration/user/user-app-role/ba2ba62a121842e0942aab9e92ce8822",
      "GET",
    );

    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenCalledWith(
      "Failed to fetch token. Status: 400",
    );

    expect(result).toEqual({ test_data: "test" });
  });
  it("can still return data from an allowed v2 endpoint if fetching token fails", async () => {
    // Note: this would still likely fail in a real-world scenario if no uuid was in the endpoint url which is grabbed by the getUUIDFromEndpoint function since our API requires a user_guid in the Authorization header
    fetch.mockResponses(
      // getToken fetch
      [JSON.stringify({ message: "Error message" }), { status: 400 }],
      // actionHandler fetch
      [JSON.stringify({ test_data: "test" }), { status: 200 }],
    );

    const result = await actionHandler(
      "registration/user/user-app-role/ba2ba62a121842e0942aab9e92ce8822",
      "GET",
    );

    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenCalledWith(
      "Failed to fetch token. Status: 400",
    );

    expect(result).toEqual({ test_data: "test" });
  });

  it("should return an error if fetching token fails and the endpoint is not allowed", async () => {
    // getToken fetch
    fetch.mockResponseOnce(JSON.stringify({ message: "Error message" }), {
      status: 400,
    });

    const result = await actionHandler("/endpoint", "GET");

    expect(consoleMock).toHaveBeenCalledTimes(2);
    expect(consoleMock).toHaveBeenCalledWith(
      "Failed to fetch token. Status: 400",
    );

    expect(result).toEqual({
      error:
        "An error occurred while fetching /endpoint: Endpoint is not allowed",
    });
  });

  it("should return an error if the fetch response is not ok", async () => {
    mockTokenResponse200();
    fetch.mockReject(new Error("Fetch failed"));
    const result = await actionHandler("/endpoint", "GET");

    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenLastCalledWith(
      "An error occurred while fetching /endpoint:",
      expect.any(Error),
    );

    expect(result).toEqual({
      error: "An error occurred while fetching /endpoint: Fetch failed",
    });
  });

  it("should call Sentry.captureException if an error occurs", async () => {
    fetch.mockResponses(
      // getToken fetch
      [JSON.stringify(responseToken), { status: 200 }],
      // actionHandler fetch
      [JSON.stringify({ message: "Error message" }), { status: 400 }],
    );

    await actionHandler("/endpoint", "GET");

    expect(sentryMock).toHaveBeenCalledOnce();
    expect(sentryMock).toHaveBeenCalledWith(expect.any(Error));
  });
});
