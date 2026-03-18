import { render, screen, fireEvent, act } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { vi } from "vitest";

import FacilitiesDataGrid from "@reporting/src/app/components/reportInformation/facilities/FacilitiesDataGrid";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";
import { FacilityRow } from "@reporting/src/app/components/reportInformation/facilities/types";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData",
  () => ({
    fetchFacilitiesPageData: vi.fn(),
  }),
);

vi.mock(
  "@reporting/src/app/components/datagrid/models/facilities/getFacilityColumns",
  () => ({
    default: vi.fn((handleCheckboxChange) => [
      { field: "is_completed", onToggle: handleCheckboxChange },
    ]),
  }),
);

vi.mock(
  "@reporting/src/app/components/datagrid/models/facilities/facilityGroupColumns",
  () => ({
    default: vi.fn(() => []),
  }),
);

vi.mock("@bciers/components/form/components/MultiStepHeader", () => ({
  default: () => <div data-testid="multi-step-header" />,
}));

vi.mock("@bciers/components/datagrid/cells/HeaderSearchCell", () => ({
  default: vi.fn(() => () => <div data-testid="header-search-cell" />),
}));

vi.mock("@bciers/components/form/components/ReportingStepButtons", () => ({
  default: ({
    saveAndContinue,
    submitButtonDisabled,
    isSaving,
    isRedirecting,
  }: any) => (
    <div>
      <div data-testid="is-saving">{String(isSaving)}</div>
      <div data-testid="is-redirecting">{String(isRedirecting)}</div>
      <button
        type="button"
        onClick={saveAndContinue}
        disabled={submitButtonDisabled}
      >
        Continue
      </button>
    </div>
  ),
}));

vi.mock("@bciers/components/datagrid/DataGrid", () => ({
  default: ({ initialData, columns, fetchPageData }: any) => {
    const toggleHandler = columns[0]?.onToggle;

    return (
      <div>
        <button
          type="button"
          onClick={async () => {
            await fetchPageData?.();
          }}
        >
          Refresh Grid
        </button>

        {initialData.rows.map((row: any, index: number) => (
          <label key={row.facility}>
            {row.facility}
            <input
              type="checkbox"
              aria-label={`complete-${row.facility}`}
              checked={row.is_completed}
              onChange={(e) => toggleHandler?.(index, e.target.checked)}
            />
          </label>
        ))}
      </div>
    );
  },
}));

const makeFacilityRow = (overrides?: Partial<FacilityRow>): FacilityRow => ({
  id: "1",
  facility: "Facility A",
  facility_bcghgid: "BCGHG-001",
  facility_name: "Facility A",
  is_completed: false,
  ...overrides,
});

describe("FacilitiesDataGrid", () => {
  const versionId = 1;
  const mockPush = vi.fn();

  const initialData = {
    rows: [
      makeFacilityRow({ facility: "A", is_completed: false }),
      makeFacilityRow({ id: "2", facility: "B", is_completed: true }),
    ],
    row_count: 2,
    is_completed_count: 1,
  };

  beforeEach(() => {
    vi.useFakeTimers();

    (useRouter as any).mockReturnValue({ push: mockPush });
    (useSearchParams as any).mockReturnValue({
      entries: () => [].values(),
    });
    (actionHandler as any).mockResolvedValue({ success: true });
    (fetchFacilitiesPageData as any).mockResolvedValue(initialData);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  const renderComponent = (
    props?: Partial<React.ComponentProps<typeof FacilitiesDataGrid>>,
  ) =>
    render(
      <FacilitiesDataGrid
        initialData={initialData as any}
        version_id={versionId}
        navigationInformation={dummyNavigationInformation}
        {...props}
      />,
    );

  it("renders initial facility rows and correct completion state", () => {
    renderComponent();

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByLabelText("complete-A")).not.toBeChecked();
    expect(screen.getByLabelText("complete-B")).toBeChecked();
  });

  it("disables 'Continue' until all facility rows are completed", () => {
    renderComponent();

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

    fireEvent.click(screen.getByLabelText("complete-A"));

    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("optimistically updates the checkbox immediately", () => {
    renderComponent();

    const checkbox = screen.getByLabelText("complete-A");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("shows saving state while a debounced save is in flight", async () => {
    let resolveRequest!: (value: unknown) => void;

    (actionHandler as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderComponent();

    fireEvent.click(screen.getByLabelText("complete-A"));

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(screen.getByTestId("is-saving")).toHaveTextContent("true");

    await act(async () => {
      resolveRequest({ success: true });
      await Promise.resolve();
    });

    expect(screen.getByTestId("is-saving")).toHaveTextContent("false");
  });

  it("rolls back checkbox state and shows an error when save fails", async () => {
    (actionHandler as any).mockRejectedValue(new Error("Save failed badly"));

    renderComponent();

    const checkbox = screen.getByLabelText("complete-A");

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Save failed badly")).toBeInTheDocument();
    expect(screen.getByLabelText("complete-A")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("calls fetchFacilitiesPageData with version_id and search params when grid refreshes", async () => {
    (useSearchParams as any).mockReturnValue({
      entries: () =>
        [
          ["page", "2"],
          ["sort_order", "asc"],
        ].values(),
    });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Refresh Grid" }));
      await Promise.resolve();
    });

    expect(fetchFacilitiesPageData).toHaveBeenCalledWith({
      version_id: versionId,
      searchParams: {
        page: "2",
        sort_order: "asc",
      },
    });
  });

  it("keeps 'Continue' enabled after search when all facilities are complete", async () => {
    (useSearchParams as any).mockReturnValue({
      entries: () => [["search", "A"]].values(),
    });

    const fullyCompletedInitialData = {
      rows: [
        makeFacilityRow({ facility: "A", is_completed: true }),
        makeFacilityRow({ id: "2", facility: "B", is_completed: true }),
      ],
      row_count: 2,
      is_completed_count: 2,
    };

    // Simulate a filtered search result coming back with only 1 visible row
    (fetchFacilitiesPageData as any).mockResolvedValue({
      rows: [makeFacilityRow({ facility: "A", is_completed: true })],
      row_count: 1,
      is_completed_count: 1,
    });

    renderComponent({
      initialData: fullyCompletedInitialData as any,
    });

    // Before search, Continue should be enabled
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

    // Trigger refresh/search
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Refresh Grid" }));
      await Promise.resolve();
    });

    // Continue should still be enabled because whole report is complete
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("navigates to continueUrl after pending saves resolve", async () => {
    let resolveRequest!: (value: unknown) => void;

    (actionHandler as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderComponent();

    fireEvent.click(screen.getByLabelText("complete-A"));

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

    await act(async () => {
      resolveRequest({ success: true });
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith(
      dummyNavigationInformation.continueUrl,
    );
  });

  it("sets redirecting state when continue is clicked", async () => {
    renderComponent({
      initialData: {
        ...initialData,
        rows: [
          makeFacilityRow({ facility: "A", is_completed: true }),
          makeFacilityRow({ id: "2", facility: "B", is_completed: true }),
        ],
        is_completed_count: 2,
      } as any,
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Continue" }));
      await Promise.resolve();
    });

    expect(screen.getByTestId("is-redirecting")).toHaveTextContent("true");
    expect(mockPush).toHaveBeenCalledWith(
      dummyNavigationInformation.continueUrl,
    );
  });
});
