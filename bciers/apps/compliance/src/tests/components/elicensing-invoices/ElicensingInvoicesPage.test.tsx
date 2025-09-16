import { render, screen } from "@testing-library/react";
import ElicensingInvoicesPage from "@/compliance/src/app/components/elicensing-invoices/ElicensingInvoicesPage";
import { useSearchParams, useSessionRole } from "@bciers/testConfig/mocks";
import { getElicensingInvoices } from "@bciers/testConfig/mocks";

const mockResponse = {
  rows: [
    {
      id: 1,
    },
    {
      id: 2,
    },
  ],
  row_count: 2,
};

describe("ElicensingInvoicesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("cas_admin");
    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });

  it("renders the grid component", async () => {
    getElicensingInvoices.mockResolvedValueOnce(mockResponse);
    render(await ElicensingInvoicesPage({ searchParams: {} }));
    expect(screen.getByRole("grid")).toBeVisible();
  });

  it("renders the appropriate error component when getElicensingInvoices fails", async () => {
    getElicensingInvoices.mockRejectedValueOnce(undefined);
    await expect(async () => {
      render(await ElicensingInvoicesPage({ searchParams: {} }));
    }).rejects.toThrow("Failed to retrieve operations");
  });
});
