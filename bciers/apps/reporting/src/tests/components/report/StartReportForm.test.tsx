import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import StartReportForm from "@reporting/src/app/components/report/StartReportForm";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@bciers/components/form/FormBase", () => ({
  default: vi.fn(({ children, onChange, onSubmit }) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          formData: {
            reporting_year: 2023,
            operation_id: "operation-1",
            registration_purpose: "Reporting Operation",
          },
        });
      }}
    >
      <button
        type="button"
        onClick={() =>
          onChange({
            formData: {
              reporting_year: 2023,
              operation_id: "operation-1",
              registration_purpose: "Reporting Operation",
            },
          })
        }
      >
        Mock Change
      </button>

      {children}
    </form>
  )),
}));

const mockActionHandler = actionHandler as ReturnType<typeof vi.fn>;
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;

const schema: RJSFSchema = {
  type: "object",
  title: "Report on a previous year",
};

const uiSchema: UiSchema = {
  "ui:order": ["reporting_year", "operation_id", "registration_purpose"],
};

describe("StartReportForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it("submits the selected report data and redirects to review operation information", async () => {
    // Arrange
    mockActionHandler.mockResolvedValue(123);

    // Act
    render(<StartReportForm schema={schema} uiSchema={uiSchema} />);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    // Assert
    await waitFor(() => {
      expect(mockActionHandler).toHaveBeenCalledWith(
        "reporting/create-report-for-reporting-year",
        "POST",
        "/reports/previous-years",
        {
          body: JSON.stringify({
            operation_id: "operation-1",
            reporting_year: 2023,
            registration_purpose: "Reporting Operation",
          }),
        },
      );
    });

    expect(mockPush).toHaveBeenCalledWith(
      "/reports/123/review-operation-information",
    );
  });

  it("renders an error alert when report creation fails", async () => {
    // Arrange
    mockActionHandler.mockResolvedValue({
      error: "Unable to create report.",
    });

    // Act
    render(<StartReportForm schema={schema} uiSchema={uiSchema} />);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    // Assert
    expect(await screen.findByText("Unable to create report.")).toBeVisible();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("goes back when cancel is clicked", () => {
    // Act
    render(<StartReportForm schema={schema} uiSchema={uiSchema} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Assert
    expect(mockBack).toHaveBeenCalledOnce();
  });
});
