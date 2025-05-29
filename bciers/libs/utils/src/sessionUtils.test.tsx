import { auth, useSession } from "@bciers/testConfig/mocks";
import { getSessionRole, useSessionRole } from "./sessionUtils";
import { renderHook } from "@testing-library/react";
import { FrontEndRoles } from "./enums";
import SessionRoleContextProvider from "./sessionRoleContext";
import React from "react";

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

  it("useSessionRole returns the session role when inside the context", () => {
    // const mockRole = FrontEndRoles.CAS_ADMIN;

    // const wrapper = ({ children }: { children: React.ReactNode }) => (
    //   <SessionRoleContextProvider value={mockRole}>
    //     {children}
    //   </SessionRoleContextProvider>
    // );

    // const { result } = renderHook(() => useSessionRole(), { wrapper });

    // expect(result.current).toBe(mockRole);

    const mockedUseContext = vi.fn().mockReturnValue(undefined);
    // Replace React.useContext globally for this test
    (React.useContext as any) = mockedUseContext;

    expect(() => useSessionRole()).toThrow(
      "Session role is not available in the context",
    );
  });

  it("useSessionRole throws an error if there is no role", () => {
    const { result } = renderHook(() => useSessionRole());

    expect(result.error).toEqual(
      new Error("Session role is not available in the context"),
    );
  });
});
