import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartReportForm from "@reporting/src/app/components/report/StartReportForm";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import expectComboBox from "@bciers/testConfig/helpers/expectComboBox";
import { selectComboboxOption } from "@bciers/testConfig/helpers/selectComboboxOption";
import { createStartReportSchemas } from "@reporting/src/data/jsonSchema/report/startReport";
import getPreviousReportableOperations from "@reporting/src/app/utils/getPreviousReportableOperations";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getPreviousReportableOperations", () => ({
  default: vi.fn(),
}));

const mockPush = vi.fn();
const mockBack = vi.fn();

const mockActionHandler = vi.mocked(actionHandler);
const mockUseRouter = vi.mocked(useRouter);
const mockGetPreviousReportableOperations = vi.mocked(
  getPreviousReportableOperations,
);

const renderForm = async () => {
  const { schema, uiSchema } = await createStartReportSchemas();

  render(<StartReportForm schema={schema} uiSchema={uiSchema} />);
};

const expectForm = () => {
  expectComboBox(/Select reporting year/i);
  expectComboBox(/Select operation/i);
  expectComboBox(/Select the registration purpose/i);

  expect(screen.getByRole("button", { name: /start/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
};

const fillForm = async () => {
  await selectComboboxOption(/Select reporting year/i, "2023");
  await selectComboboxOption(/Select operation/i, "Operation 1");
  await selectComboboxOption(
    /Select the registration purpose/i,
    "Reporting Operation",
  );
};

describe("StartReportForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);

    mockGetPreviousReportableOperations.mockResolvedValue([
      {
        reporting_year: 2023,
        operation_id: "operation-1",
        operation_name: "Operation 1",
        registration_purposes: ["Reporting Operation"],
      },
    ]);
  });

  it("renders the generated start report form", async () => {
    await renderForm();

    expectForm();
  });

  it("submits the selected report data and redirects to review operation information", async () => {
    mockActionHandler.mockResolvedValue(123);

    await renderForm();
    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: /start/i }));

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

  it("renders validation errors when report creation fails", async () => {
    mockActionHandler.mockResolvedValue({
      error: "Unable to create report.",
      validation: {
        errors: [
          {
            key: "generic_error",
            error: {
              severity: "Error",
              message: "Unable to create report.",
            },
          },
        ],
      },
    });

    await renderForm();
    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: /start/i }));

    expect(await screen.findByText("Unable to create report.")).toBeVisible();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("falls back to the generic error message when validation errors are not returned", async () => {
    mockActionHandler.mockResolvedValue({
      error: "Unable to create report.",
    });

    await renderForm();
    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: /start/i }));

    expect(await screen.findByText("Unable to create report.")).toBeVisible();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("returns to the previous reports page when Cancel is clicked", async () => {
    await renderForm();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/reports/previous-years");
    expect(mockBack).not.toHaveBeenCalled();
  });
});
