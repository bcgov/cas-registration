import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { vi } from "vitest";
import NewEntrantInformationForm from "@reporting/src/app/components/additionalInformation/newEntrantInformation/NewEntrantInformationForm";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

describe("NewEntrantInformationForm Component", () => {
  const versionId = 1;
  const products = [
    { id: 1, name: "Product A" },
    { id: 2, name: "Product B" },
  ];
  const initialFormData = { assertion_statement: true };
  const dateOfAuthorization = "2024-01-01";
  const dateOfFirstShipment = "2024-06-01";
  const dateOfNewEntrantPeriod = "2024-12-01";
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    });

    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial data", async () => {
    render(
      <NewEntrantInformationForm
        versionId={versionId}
        products={products}
        initialFormData={initialFormData}
        dateOfAuthorization={dateOfAuthorization}
        dateOfFirstShipment={dateOfFirstShipment}
        dateOfNewEntrantPeriod={dateOfNewEntrantPeriod}
      />,
    );

    const formTitle = await screen.findByText("New entrant information");
    expect(formTitle).toBeInTheDocument();
  });

  it("disables submit button initially if assertion statement is false", async () => {
    render(
      <NewEntrantInformationForm
        versionId={versionId}
        products={products}
        initialFormData={{ assertion_statement: false }}
        dateOfAuthorization={dateOfAuthorization}
        dateOfFirstShipment={dateOfFirstShipment}
        dateOfNewEntrantPeriod={dateOfNewEntrantPeriod}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save And Continue/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when assertion statement is true", async () => {
    render(
      <NewEntrantInformationForm
        versionId={versionId}
        products={products}
        initialFormData={{ assertion_statement: true }}
        dateOfAuthorization={dateOfAuthorization}
        dateOfFirstShipment={dateOfFirstShipment}
        dateOfNewEntrantPeriod={dateOfNewEntrantPeriod}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save And Continue/i,
    });
    expect(submitButton).toBeEnabled();
  });

  it("submits form data and redirects on success", async () => {
    render(
      <NewEntrantInformationForm
        versionId={versionId}
        products={products}
        initialFormData={initialFormData}
        dateOfAuthorization={dateOfAuthorization}
        dateOfFirstShipment={dateOfFirstShipment}
        dateOfNewEntrantPeriod={dateOfNewEntrantPeriod}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save And Continue/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith(
      `/reports/${versionId}/compliance-summary`,
    );
  });
});
