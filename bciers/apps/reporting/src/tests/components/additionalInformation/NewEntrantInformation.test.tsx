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
  let initialFormData = {
    authorization_date: "2024-12-10T09:00:00Z",
    first_shipment_date: "2024-12-25T09:00:00Z",
    new_entrant_period_start: "2024-12-18T09:00:00Z",
    assertion_statement: true,
    id: 1,
  };

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
        initialFormData={initialFormData}
      />,
    );

    const formTitle = await screen.findByText("New entrant information");
    expect(formTitle).toBeInTheDocument();
  });

  it("disables submit button initially if assertion statement is false", async () => {
    initialFormData = { assertion_statement: false };
    render(
      <NewEntrantInformationForm
        versionId={versionId}
        initialFormData={initialFormData}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save And Continue/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when assertion statement is true", async () => {
    initialFormData = { assertion_statement: true };
    render(
      <NewEntrantInformationForm
        versionId={versionId}
        initialFormData={initialFormData}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save And Continue/i,
    });
    expect(submitButton).toBeEnabled();
  });

  it("submits form data and redirects on success", async () => {
    initialFormData = {
      authorization_date: "2024-12-10T09:00:00Z",
      first_shipment_date: "2024-12-25T09:00:00Z",
      new_entrant_period_start: "2024-12-18T09:00:00Z",
      assertion_statement: true,
      id: 1,
    };

    render(
      <NewEntrantInformationForm
        versionId={versionId}
        initialFormData={initialFormData}
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
