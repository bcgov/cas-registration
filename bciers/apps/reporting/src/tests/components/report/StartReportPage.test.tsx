import { render, screen } from "@testing-library/react";
import StartReportPage from "@reporting/src/app/components/report/StartReportPage";
import { createStartReportSchemas } from "@reporting/src/data/jsonSchema/report/startReport";
import StartReportForm from "@reporting/src/app/components/report/StartReportForm";

vi.mock("@reporting/src/data/jsonSchema/report/startReport", () => ({
  createStartReportSchemas: vi.fn(),
}));

vi.mock("@reporting/src/app/components/report/StartReportForm", () => ({
  default: vi.fn(() => <div>Mock Start Report Form</div>),
}));

const mockCreateStartReportSchemas = createStartReportSchemas as ReturnType<
  typeof vi.fn
>;

const mockStartReportForm = StartReportForm as ReturnType<typeof vi.fn>;

describe("StartReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders StartReportForm with generated schema and uiSchema", async () => {
    const schema = {
      type: "object",
      title: "Report on a previous year",
    };

    const uiSchema = {
      "ui:order": ["reporting_year", "operation_id", "registration_purpose"],
    };

    mockCreateStartReportSchemas.mockResolvedValue({
      schema,
      uiSchema,
    });

    const page = await StartReportPage();

    render(page);

    expect(screen.getByText("Mock Start Report Form")).toBeVisible();
    expect(mockCreateStartReportSchemas).toHaveBeenCalledOnce();
    expect(mockStartReportForm).toHaveBeenCalledWith(
      {
        schema,
        uiSchema,
      },
      undefined,
    );
  });
});
