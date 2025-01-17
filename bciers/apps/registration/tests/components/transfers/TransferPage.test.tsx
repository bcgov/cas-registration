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
      render(await TransferPage({})); // passing empty object as props so that it doesn't throw an error when destructuring
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
    render(await TransferPage({})); // passing empty object as props so that it doesn't throw an error when destructuring
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Transfer Entity",
    );
    expect(
      screen.getByText(/select the operators involved/i),
    ).toBeInTheDocument();
  });
});
