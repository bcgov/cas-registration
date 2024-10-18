import { useSession } from "@bciers/testConfig/mocks";
import { Session } from "@bciers/testConfig/types";
import { vi } from "vitest";

// ⛏️ Helper function to mock the useSession hook with default values
export const mockUseSession = (
  fullName: string = "bc-cas-dev secondary",
  appRole: string = "industry_user",
) => {
  const update = vi.fn(); // Mock the update function

  useSession.mockReturnValue({
    data: {
      user: {
        full_name: fullName,
        app_role: appRole,
      },
    },
    update, // Include the mocked update function
  } as Session);

  return { update }; // Return the update function for assertions in tests
};
