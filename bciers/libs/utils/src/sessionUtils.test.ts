import { auth, useSession } from "@bciers/testConfig/mocks";
import { getSessionRole, useSessionRole } from "./sessionUtils";

useSession.mockReturnValue({
  get: vi.fn(),
});

describe("Operator component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });
  it("getSessionRole throws error when there is no role", async () => {
    await expect(getSessionRole()).rejects.toThrow(
      "Failed to retrieve session role",
    );
  });
  it("getSessionRole returns role", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user" },
    });
    await expect(getSessionRole()).resolves.toBe("industry_user");
  });
  it("useSessionRole throws error when there is no role", () => {
    useSession.mockReturnValue({
      data: null,
    });
    expect(() => useSessionRole()).toThrow("Failed to retrieve session role");
  });
  it("useSessionRole returns role", () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    });
    expect(useSessionRole()).toBe("cas_admin");
  });
});
