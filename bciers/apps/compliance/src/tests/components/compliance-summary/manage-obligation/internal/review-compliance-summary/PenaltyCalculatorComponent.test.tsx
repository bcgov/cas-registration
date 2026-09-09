import { render, screen, waitFor } from "@testing-library/react";
import PenaltyCalculatorComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyCalculatorComponent";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";

let nextFormData: any;

vi.mock("@bciers/components/form", () => ({
  FormBase: ({
    children,
    formData,
    onChange,
  }: {
    children: React.ReactNode;
    formData: any;
    onChange: (e: { formData: any }) => void;
  }) => (
    <div data-testid="form-base">
      <div data-testid="form-data">{JSON.stringify(formData)}</div>
      <button
        type="button"
        onClick={() => onChange({ formData: nextFormData })}
      >
        Trigger Change
      </button>
      {children}
    </div>
  ),
}));

vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  __esModule: true,
  default: ({ backUrl }: { backUrl: string }) => <div>Back: {backUrl}</div>,
}));

vi.mock("@/compliance/src/app/utils/getPenaltyAccrualCalculationData", () => ({
  getPenaltyAccrualCalculationData: vi.fn(),
}));

const mockedGetPenaltyAccrualCalculationData =
  getPenaltyAccrualCalculationData as unknown as ReturnType<typeof vi.fn>;

describe("PenaltyCalculatorComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextFormData = undefined;
  });

  it("renders initial mapped form data and step buttons back URL", () => {
    render(
      <PenaltyCalculatorComponent
        complianceReportVersionId={123}
        initialPenaltyType="automatic_overdue"
        initialFinalDayOfPenaltyAccrual="2026-01-15"
        penaltyData={{
          automatic_overdue_penalty_status: "NOT PAID",
          ggeapar_interest_status: "N/A",
          days_late: 5,
          total_penalty: 50.25,
          daily_accumulated_list: [
            {
              date: "2026-01-10",
              daily_penalty: 10,
              daily_compounded: 1,
              accumulated_penalty: 10,
              accumulated_compounded: 1,
              interest_rate: 5,
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId("form-base")).toBeVisible();
    expect(
      screen.getByText(
        "Back: /compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
      ),
    ).toBeVisible();

    const formDataText = screen.getByTestId("form-data").textContent ?? "";
    expect(formDataText).toContain(
      '"requested_penalty_type":"automatic_overdue"',
    );
    expect(formDataText).toContain(
      '"final_day_of_penalty_accrual":"2026-01-15"',
    );
    expect(formDataText).toContain('"total_penalty_amount":50.25');
    expect(formDataText).toContain('"days_late":5');
  });

  it("normalizes penalty type and date before requesting updated penalty data", async () => {
    mockedGetPenaltyAccrualCalculationData.mockResolvedValue({
      automatic_overdue_penalty_status: "NOT PAID",
      ggeapar_interest_status: "NONE",
      requested_penalty_type: "ggeapar",
      days_late: 12,
      total_penalty: 321.09,
      daily_accumulated_list: [
        {
          date: "2026-03-10",
          daily_penalty: 20,
          daily_compounded: 2,
          accumulated_penalty: 20,
          accumulated_compounded: 2,
          interest_rate: 3,
        },
      ],
    });

    nextFormData = {
      requested_penalty_type: "Late Submission",
      final_day_of_penalty_accrual: "2026-03-10T00:00:00Z",
      penalty_summary: {},
      accrual_data: { tableData: [] },
    };

    render(
      <PenaltyCalculatorComponent
        complianceReportVersionId={999}
        initialPenaltyType="automatic_overdue"
        initialFinalDayOfPenaltyAccrual="2026-01-15"
      />,
    );

    screen.getByRole("button", { name: "Trigger Change" }).click();

    await waitFor(() => {
      expect(mockedGetPenaltyAccrualCalculationData).toHaveBeenCalledWith(999, {
        requested_penalty_type: "ggeapar",
        final_day_of_penalty_accrual: "2026-03-10",
      });
    });

    await waitFor(() => {
      const formDataText = screen.getByTestId("form-data").textContent ?? "";
      expect(formDataText).toContain('"requested_penalty_type":"ggeapar"');
      expect(formDataText).toContain(
        '"final_day_of_penalty_accrual":"2026-03-10"',
      );
      expect(formDataText).toContain('"total_penalty_amount":321.09');
      expect(formDataText).toContain('"days_late":12');
    });
  });

  it("shows warning message when recalculation API returns an error", async () => {
    mockedGetPenaltyAccrualCalculationData.mockResolvedValue({
      error: "Penalty calculation is unavailable",
    });

    nextFormData = {
      requested_penalty_type: "automatic_overdue",
      final_day_of_penalty_accrual: "2026-02-01",
      penalty_summary: {},
      accrual_data: { tableData: [] },
    };

    render(
      <PenaltyCalculatorComponent
        complianceReportVersionId={777}
        initialPenaltyType="automatic_overdue"
        initialFinalDayOfPenaltyAccrual="2026-01-15"
      />,
    );

    screen.getByRole("button", { name: "Trigger Change" }).click();

    expect(
      await screen.findByText("Penalty calculation is unavailable"),
    ).toBeVisible();
  });

  it("does not call recalculation when final day cannot be normalized", async () => {
    nextFormData = {
      requested_penalty_type: "ggeapar",
      final_day_of_penalty_accrual: "02/01/2026",
      penalty_summary: {},
      accrual_data: { tableData: [] },
    };

    render(
      <PenaltyCalculatorComponent
        complianceReportVersionId={555}
        initialPenaltyType="automatic_overdue"
        initialFinalDayOfPenaltyAccrual="2026-01-15"
      />,
    );

    screen.getByRole("button", { name: "Trigger Change" }).click();

    await waitFor(() => {
      expect(mockedGetPenaltyAccrualCalculationData).not.toHaveBeenCalled();
    });
  });

  it("ignores stale responses from older requests", async () => {
    const dateNowMock = vi
      .spyOn(Date, "now")
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(200);

    let resolveFirstRequest: (value: any) => void;
    let resolveSecondRequest: (value: any) => void;

    const firstPromise = new Promise((resolve) => {
      resolveFirstRequest = resolve;
    });

    const secondPromise = new Promise((resolve) => {
      resolveSecondRequest = resolve;
    });

    mockedGetPenaltyAccrualCalculationData
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => secondPromise);

    render(
      <PenaltyCalculatorComponent
        complianceReportVersionId={222}
        initialPenaltyType="automatic_overdue"
        initialFinalDayOfPenaltyAccrual="2026-01-15"
      />,
    );

    nextFormData = {
      requested_penalty_type: "automatic_overdue",
      final_day_of_penalty_accrual: "2026-03-01",
      penalty_summary: {},
      accrual_data: { tableData: [] },
    };
    screen.getByRole("button", { name: "Trigger Change" }).click();

    nextFormData = {
      requested_penalty_type: "automatic_overdue",
      final_day_of_penalty_accrual: "2026-03-02",
      penalty_summary: {},
      accrual_data: { tableData: [] },
    };
    screen.getByRole("button", { name: "Trigger Change" }).click();

    resolveSecondRequest!({
      automatic_overdue_penalty_status: "NOT PAID",
      ggeapar_interest_status: "N/A",
      days_late: 2,
      total_penalty: 222,
      daily_accumulated_list: [],
    });

    await waitFor(() => {
      const formDataText = screen.getByTestId("form-data").textContent ?? "";
      expect(formDataText).toContain(
        '"final_day_of_penalty_accrual":"2026-03-02"',
      );
      expect(formDataText).toContain('"total_penalty_amount":222');
    });

    resolveFirstRequest!({
      automatic_overdue_penalty_status: "NOT PAID",
      ggeapar_interest_status: "N/A",
      days_late: 1,
      total_penalty: 111,
      daily_accumulated_list: [],
    });

    await waitFor(() => {
      const formDataText = screen.getByTestId("form-data").textContent ?? "";
      expect(formDataText).toContain(
        '"final_day_of_penalty_accrual":"2026-03-02"',
      );
      expect(formDataText).toContain('"total_penalty_amount":222');
      expect(formDataText).not.toContain('"total_penalty_amount":111');
    });

    dateNowMock.mockRestore();
  });
});
