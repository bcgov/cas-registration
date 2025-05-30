import { auth, useContext } from "@bciers/testConfig/mocks";
// we need both unmocks or else the sessionUtils will be spies instead of the actual functions
vi.unmock("@bciers/utils/src/sessionUtils");
vi.unmock("./sessionUtils");
import { getSessionRole, useSessionRole } from "./sessionUtils";
import { FrontEndRoles } from "./enums";

describe("Operator component", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
  });

  it("getSessionRole throws error when there is no role", async () => {
    await expect(getSessionRole()).rejects.toThrow(
      "Failed to retrieve session role",
    );
  });

  it("getSessionRole returns role", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: FrontEndRoles.INDUSTRY_USER },
    });
    await expect(getSessionRole()).resolves.toBe(FrontEndRoles.INDUSTRY_USER);
  });

  it("useSessionRole throws error when there is no role", () => {
    useContext.mockReturnValue(null);
    expect(() => useSessionRole()).toThrow(
      "Session role is not available in the context",
    );
  });

  it("useSessionRole returns role", () => {
    useContext.mockReturnValue(FrontEndRoles.CAS_ADMIN);
    expect(useSessionRole()).toBe(FrontEndRoles.CAS_ADMIN);
  });
});
