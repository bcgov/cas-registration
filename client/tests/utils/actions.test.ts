import { describe, expect } from "vitest";
import { getToken } from "@/app/utils/actions";
import { fetch } from "@/tests/setup/mocks";

vi.unmock("@/app/utils/actions");

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    toString: vi.fn(() => "cookie"),
  })),
}));

const response = {
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

describe("getToken function", () => {
  const consoleMock = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  afterAll(() => {
    consoleMock.mockReset();
  });

  it("should return the token", async () => {
    fetch.mockResponse(JSON.stringify(response), {
      status: 200,
    });
    const result = await getToken();

    expect(result).toEqual(response);
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

    expect(consoleMock).toHaveBeenCalledTimes(2);
    expect(consoleMock).toHaveBeenLastCalledWith(
      "Failed to fetch token. Status: 400",
    );

    expect(result).toEqual({});
  });
});
