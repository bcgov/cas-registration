import { render, screen } from "@testing-library/react";
import { getSessionRole } from "@bciers/testConfig/mocks";
import TransfersHeader from "@/registration/app/components/transfers/TransfersHeader";
import { FrontEndRoles } from "@bciers/utils/src/enums";

describe("TransfersHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always renders the Transfers heading", async () => {
    getSessionRole.mockReturnValue(FrontEndRoles.CAS_ADMIN);

    render(await TransfersHeader());

    expect(screen.getByRole("heading", { name: /transfers/i })).toBeVisible();
  });

  it.each([FrontEndRoles.CAS_ANALYST, FrontEndRoles.CAS_DIRECTOR])(
    "shows the 'Make a Transfer' button to %s users",
    async (role) => {
      getSessionRole.mockReturnValue(role);

      render(await TransfersHeader());

      expect(
        screen.getByRole("button", { name: /make a transfer/i }),
      ).toBeVisible();

      expect(
        screen.getByRole("link", { name: /make a transfer/i }),
      ).toHaveAttribute("href", "/transfers/transfer-entity");
    },
  );

  it.each([
    FrontEndRoles.CAS_ADMIN,
    FrontEndRoles.INDUSTRY_USER,
    FrontEndRoles.INDUSTRY_USER_ADMIN,
    FrontEndRoles.CAS_PENDING,
  ] as const)(
    "does not show the 'Make a Transfer' button to %s users",
    async (role) => {
      getSessionRole.mockReturnValue(role);

      render(await TransfersHeader());

      expect(
        screen.queryByRole("button", { name: /make a transfer/i }),
      ).not.toBeInTheDocument();
    },
  );
});
