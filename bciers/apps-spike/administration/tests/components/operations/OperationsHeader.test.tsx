import { render, screen } from "@testing-library/react";
import { auth, useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import OperationsHeader from "apps/administration/app/components/operations/OperationsHeader";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(async () => {
    const session = auth();
    return session?.user?.app_role ?? "";
  }),
}));

describe("OperationsHeader component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the external operations note for industry users", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });

    render(await OperationsHeader());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the operations owned by your operator here.",
    );
  });

  it("renders the internal operations note for CAS users", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_admin" },
    });

    render(await OperationsHeader());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View all the operations, which can be sorted or filtered by operator here.",
    );
  });
});
