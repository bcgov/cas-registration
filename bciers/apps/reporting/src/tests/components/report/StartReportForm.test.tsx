import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import StartReportForm from "@reporting/src/app/components/report/StartReportForm";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import expectComboBox from "@bciers/testConfig/helpers/expectComboBox";
import { selectComboboxOption } from "@bciers/testConfig/helpers/selectComboboxOption";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();
const mockBack = vi.fn();

const mockActionHandler = vi.mocked(actionHandler);
const mockUseRouter = vi.mocked(useRouter);

const schema: RJSFSchema = {
  type: "object",
  required: ["reporting_year", "operation_id", "registration_purpose"],
  properties: {
    reporting_year: {
      type: "number",
      title: "Reporting year",
      enum: [2023],
    },
    operation_id: {
      type: "string",
      title: "Operation",
      enum: ["operation-1"],
    },
    registration_purpose: {
      type: "string",
      title: "Registration purpose",
      enum: ["Reporting Operation"],
    },
  },
};

const uiSchema: UiSchema = {};

const renderForm = () => {
  render(<StartReportForm schema={schema} uiSchema={uiSchema} />);
};

const expectForm = () => {
  expectComboBox(/Reporting year/i);
  expectComboBox(/Operation/i);
  expectComboBox(/Registration purpose/i);

  expect(screen.getByRole("button", { name: /start/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
};

const fillForm = async () => {
  await selectComboboxOption(/Reporting year/i, "2023");
  await selectComboboxOption(/Operation/i, "operation-1");
  await selectComboboxOption(/Registration purpose/i, "Reporting Operation");
};

describe("StartReportForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it("renders the form", () => {
    renderForm();

    expectForm();
  });

  it("submits the selected report data and redirects to review operation information", async () => {
    mockActionHandler.mockResolvedValue(123);

    renderForm();

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

    renderForm();

    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: /start/i }));

    expect(await screen.findByText("Unable to create report.")).toBeVisible();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("falls back to the generic error message when validation errors are not returned", async () => {
    mockActionHandler.mockResolvedValue({
      error: "Unable to create report.",
    });

    renderForm();

    await fillForm();

    await userEvent.click(screen.getByRole("button", { name: /start/i }));

    expect(await screen.findByText("Unable to create report.")).toBeVisible();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("goes back when Cancel is clicked", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockBack).toHaveBeenCalledOnce();
  });
});
