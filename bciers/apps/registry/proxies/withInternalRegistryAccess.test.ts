import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import { getToken } from "@bciers/testConfig/mocks";
import { mockBaseToken } from "@bciers/testConfig/data/tokens";
import proxy from "../proxy";

vi.spyOn(NextResponse, "redirect");

describe("Registry proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["cas_admin", "cas_analyst", "cas_director", "cas_view_only"])(
    "allows %s users",
    async (appRole) => {
      getToken.mockResolvedValue({ ...mockBaseToken, app_role: appRole });

      const result = await proxy(
        mockRequest("/registry"),
        {} as NextFetchEvent,
      );

      expect(result?.status).toBe(200);
    },
  );

  it("redirects authenticated industry users to the dashboard", async () => {
    getToken.mockResolvedValue({
      ...mockBaseToken,
      app_role: "industry_user_admin",
    });

    await proxy(mockRequest("/registry"), {} as NextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL("/", domain));
  });
});
