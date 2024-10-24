import { render, screen } from "@testing-library/react";
import { getOperator } from "./mocks";
import OperatorDetailsPage from "@/administration/app/components/operators/OperatorDetailsPage";
import { expect } from "vitest";

vi.mock("@bciers/actions", () => ({
  fetchDashboardData: vi.fn(() => [
    {
      title: "Information",
      content: "View information of this operator.",
      href: "/administration/operators/operator-id/information",
    },
    {
      title: "Operations",
      content: "View the operations owned by this operator.",
      href: "/administration/operators/operator-id/operations",
    },
    {
      title: "Contacts",
      content: "View the contacts of this operator.",
      href: "/administration/operators/operator-id/contacts",
    },
  ]),
}));

const operatorId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";

describe("OperatorDetailsPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the appropriate error component when getOperator fails", async () => {
    getOperator.mockReturnValueOnce({
      error: "some error",
    });
    await expect(async () => {
      render(await OperatorDetailsPage({ operatorId }));
    }).rejects.toThrow("Failed to retrieve Operator details");
  });
  it("renders the operator details page with proper tiles", async () => {
    getOperator.mockReturnValueOnce({
      legal_name: "Test Operator Name",
      // We don't care about the other fields for this test
    });
    render(await OperatorDetailsPage({ operatorId }));
    expect(screen.getByText(/Test Operator Name Details/i)).toBeVisible();

    const informationTitleLink = screen.getByRole("link", {
      name: /Information/,
    });
    expect(informationTitleLink).toBeVisible();
    expect(informationTitleLink).toHaveAttribute(
      "href",
      `/administration/operators/${operatorId}/operator-details/information?operator_id=${operatorId}`,
    );

    const operationsTitleLink = screen.getByRole("link", {
      name: /Operations/,
    });
    expect(operationsTitleLink).toBeVisible();
    expect(operationsTitleLink).toHaveAttribute(
      "href",
      `/administration/operators/${operatorId}/operator-details/operations?operator_id=${operatorId}`,
    );

    const contactsTitleLink = screen.getByRole("link", {
      name: /Contacts/,
    });
    expect(contactsTitleLink).toBeVisible();
    expect(contactsTitleLink).toHaveAttribute(
      "href",
      `/administration/operators/${operatorId}/operator-details/contacts?operator_id=${operatorId}`,
    );
  });
});
