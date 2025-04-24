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
        initialFormData={{}}
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
});
