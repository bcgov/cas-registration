import { render, screen } from "@testing-library/react";
import { fetchOperatorsPageData } from "apps/administration/tests/components/operators/mocks";
import TransferPage from "@/registration/app/components/transfers/TransferPage";

describe("Transfer page", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("throws an error when there's a problem fetching operators data", async () => {
    fetchOperatorsPageData.mockReturnValueOnce({
      rows: undefined,
      row_count: undefined,
    });
    await expect(async () => {
      render(await TransferPage());
    }).rejects.toThrow("Failed to fetch operators data");
  });

  it("renders the TransferPage", async () => {
    fetchOperatorsPageData.mockReturnValueOnce({
      rows: [
        {
          id: "1",
        },
      ],
      row_count: 1,
    });
    render(await TransferPage());
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Transfer Entity",
    );
    expect(
      screen.getByText(/select the operators involved/i),
    ).toBeInTheDocument();
  });
});
