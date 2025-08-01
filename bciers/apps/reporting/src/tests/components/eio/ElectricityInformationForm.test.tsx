import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { beforeEach, vi } from "vitest";
import { dummyNavigationInformation } from "../taskList/utils";
import ElectricityInformationForm from "@reporting/src/app/components/eio/ElectricityInformationForm";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockPush = vi.fn();
const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = actionHandler as vi.MockedFunction<
  typeof actionHandler
>;
const mockVersionId = 1;

describe("ElectricityInformationForm Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush, refresh: vi.fn() });
    mockActionHandler.mockResolvedValue({ success: true }); // Mock successful action handler
  });

  afterEach(() => vi.clearAllMocks());

  it("renders form with correct initial fields", async () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      await screen.findByText("Electricity Import Data"),
    ).toBeInTheDocument();
  });

  it("updates formData when form input changes", () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const input = screen.getByLabelText(
      /Amount of imported electricity - specified sources/i,
    );
    fireEvent.change(input, { target: { value: "1234" } });

    expect(input).toHaveValue("1234");
  });

  it("submits form data and handles success", async () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{
          import_specified_electricity: 0,
          import_specified_emissions: 0,
          import_unspecified_electricity: 0,
          import_unspecified_emissions: 0,
          export_specified_electricity: 0,
          export_specified_emissions: 0,
          export_unspecified_electricity: 0,
          export_unspecified_emissions: 0,
          canadian_entitlement_electricity: 0,
          canadian_entitlement_emissions: 0,
        }}
        navigationInformation={{
          ...dummyNavigationInformation,
          continueUrl: "/next-page",
        }}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/next-page");
    });
  });
  it("renders all expected form fields", async () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const inputs = await screen.findAllByRole("textbox");
    expect(inputs).toHaveLength(10);
  });
});
