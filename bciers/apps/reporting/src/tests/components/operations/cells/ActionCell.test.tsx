import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "@reporting/src/app/components/operations/cells/ActionCell";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import { createReport } from "@reporting/src/app/utils/createReport";
import { createReportVersion } from "@reporting/src/app/utils/createReportVersion";
import { getReportingYear } from "@bciers/actions/api";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock API actions
vi.mock("@reporting/src/app/utils/createReport", () => ({
  createReport: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/createReportVersion", () => ({
  createReportVersion: vi.fn(),
}));

vi.mock("@bciers/actions/api", () => ({
  getReportingYear: vi.fn(),
}));

describe("ActionCell", () => {
  interface ActionCellRow {
    operation_id: number;
    report_id?: number | null;
    report_version_id?: string | number | null;
    report_status?: ReportOperationStatus | string | null;
    restricted?: boolean;
  }

  interface ActionCellParams extends GridRenderCellParams {
    row: ActionCellRow;
    isReportingOpen: boolean;
  }

  const createMockParams = (
    operationId: number,
    isReportingOpen: boolean = true,
    reportId: number | null = null,
    reportVersionId: string | number | null = null,
    reportStatus: ReportOperationStatus | string | null = null,
    restricted: boolean = false,
  ): ActionCellParams =>
    ({
      row: {
        operation_id: operationId,
        report_id: reportId,
        report_version_id: reportVersionId,
        report_status: reportStatus,
        restricted,
      },
      isReportingOpen,
    }) as unknown as ActionCellParams;

  const expectButton = (name: string) => {
    const button = screen.getByRole("button", { name });
    expect(button).toBeVisible();
    return button;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location for full-page redirection checks
    delete (window as unknown as Record<string, unknown>).location;
    window.location = { href: "" } as unknown as Location;
  });

  describe("Restricted / Closed Reporting Flow", () => {
    it("displays 'Available Soon' when reporting is not open", () => {
      render(<ActionCell {...createMockParams(100, false)} />);

      expect(screen.getByText("Available Soon")).toBeVisible();
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("displays 'Available Soon' when row is restricted, even if reporting is open", () => {
      render(
        <ActionCell {...createMockParams(100, true, null, null, null, true)} />,
      );

      expect(screen.getByText("Available Soon")).toBeVisible();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("Start New Report Flow", () => {
    it("displays 'Start' button when no reportVersionId exists", () => {
      render(<ActionCell {...createMockParams(100, true)} />);

      expectButton("Start");
    });

    it("calls getReportingYear, createReport, and navigates on 'Start' click", async () => {
      vi.mocked(getReportingYear).mockResolvedValue({
        reporting_year: 2025,
      } as any);
      vi.mocked(createReport).mockResolvedValue("3" as any);

      render(<ActionCell {...createMockParams(100, true)} />);

      const button = expectButton("Start");
      fireEvent.click(button);

      await waitFor(() => {
        expect(getReportingYear).toHaveBeenCalledTimes(1);
        expect(createReport).toHaveBeenCalledWith(100, 2025);
        expect(window.location.href).toBe("3/review-operation-information");
      });
    });

    it("creates a new report version when report_id exists but report_version_id does not", async () => {
      vi.mocked(createReportVersion).mockResolvedValue("5" as any);

      render(<ActionCell {...createMockParams(100, true, 42, null)} />);

      const button = expectButton("Start");
      fireEvent.click(button);

      await waitFor(() => {
        expect(createReportVersion).toHaveBeenCalledWith(100, 42);
        expect(window.location.href).toBe("5/review-operation-information");
      });
    });
  });

  describe("Draft Report Flow", () => {
    it("displays 'Continue' button and navigates to review page when report status is DRAFT", async () => {
      render(
        <ActionCell
          {...createMockParams(100, true, 10, "3", ReportOperationStatus.DRAFT)}
        />,
      );

      const button = expectButton("Continue");
      fireEvent.click(button);

      await waitFor(() => {
        expect(window.location.href).toBe("3/review-operation-information");
      });
    });

    it("displays 'Continue' button when report status is DRAFT_SUPPLEMENTARY", async () => {
      render(
        <ActionCell
          {...createMockParams(
            100,
            true,
            10,
            "3",
            ReportOperationStatus.DRAFT_SUPPLEMENTARY,
          )}
        />,
      );

      const button = expectButton("Continue");
      fireEvent.click(button);

      await waitFor(() => {
        expect(window.location.href).toBe("3/review-operation-information");
      });
    });
  });

  describe("Submitted Report Flow", () => {
    it("displays 'View Details' button and navigates to submitted page when status is SUBMITTED", async () => {
      render(
        <ActionCell
          {...createMockParams(
            100,
            true,
            10,
            "3",
            ReportOperationStatus.SUBMITTED,
          )}
        />,
      );

      const button = expectButton("View Details");
      fireEvent.click(button);

      await waitFor(() => {
        expect(window.location.href).toBe("3/submitted");
      });
    });

    it("displays 'View Details' button when status is SUBMITTED_SUPPLEMENTARY", async () => {
      render(
        <ActionCell
          {...createMockParams(
            100,
            true,
            10,
            "3",
            ReportOperationStatus.SUBMITTED_SUPPLEMENTARY,
          )}
        />,
      );

      const button = expectButton("View Details");
      fireEvent.click(button);

      await waitFor(() => {
        expect(window.location.href).toBe("3/submitted");
      });
    });
  });

  describe("Transition Error Handling", () => {
    it("propagates API failure errors during transition to trigger error boundaries", async () => {
      vi.mocked(getReportingYear).mockResolvedValue({
        reporting_year: 2025,
      } as any);
      vi.mocked(createReport).mockResolvedValue({
        error: "Creation Failed",
      } as any);

      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const unhandledErrorPromise = new Promise<Error>((resolve) => {
        const handler = (event: ErrorEvent) => {
          event.preventDefault();
          window.removeEventListener("error", handler);
          resolve(event.error);
        };
        window.addEventListener("error", handler);
      });

      render(<ActionCell {...createMockParams(100, true)} />);

      const button = expectButton("Start");
      fireEvent.click(button);

      const error = await unhandledErrorPromise;
      expect(error.message).toBe(
        "We couldn't create a report for operation ID '100' and reporting year '2025': Creation Failed.",
      );

      consoleError.mockRestore();
    });
  });
});
