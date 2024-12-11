import { fireEvent, render, screen } from "@testing-library/react";
import { UUID } from "crypto";
import { expect, vi } from "vitest";
import TransferSuccess from "@/registration/app/components/transfers/TransferSuccess";
import { useRouter } from "@bciers/testConfig/mocks";

const mockOperators = [
  {
    id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063" as UUID,
    legal_name: "Operator 1",
    business_structure: "Corporation",
    cra_business_number: "123456789",
    bc_corporate_registry_number: "123456789",
  },
  {
    id: "8be4c7aa-6ab3-4aad-9206-0ef914fea064" as UUID,
    legal_name: "Operator 2",
    business_structure: "Corporation",
    cra_business_number: "123456789",
    bc_corporate_registry_number: "123456789",
  },
];
const defaultProps = {
  fromOperatorId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063" as UUID,
  toOperatorId: "8be4c7aa-6ab3-4aad-9206-0ef914fea064" as UUID,
  operators: mockOperators,
  effectiveDate: "2022-01-01",
  transferEntity: "Operation",
};

const mockPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

describe("The TransferSuccess component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders transferred message when effective date is in the past", () => {
    render(<TransferSuccess {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: /Transfer Entity/i }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /transferred/i })).toBeVisible();
    expect(
      screen.getByText(
        /Operation has been transferred from Operator 1 to Operator 2/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(/Operation is now in the account of Operator 2/i),
    ).toBeVisible();

    expect(
      screen.getByRole("button", {
        name: /Return to Transfer Requests Table/i,
      }),
    ).toBeVisible();
  });

  it("renders pending transfer message when effective date is in the future", () => {
    const futureDate = "2099-10-10:09:00:00Z";
    const updatedProps = { ...defaultProps, effectiveDate: futureDate };

    render(<TransferSuccess {...updatedProps} />);

    expect(
      screen.getByText(
        /Operation will be transferred from Operator 1 to Operator 2 on Oct 10, 2099/i,
      ),
    ).toBeVisible();
  });

  it("navigates to transfers page when the button is clicked", () => {
    render(<TransferSuccess {...defaultProps} />);

    const button = screen.getByRole("button", {
      name: /Return to Transfer Requests Table/i,
    });
    expect(button).toBeVisible();
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith("/transfers");
  });
});
