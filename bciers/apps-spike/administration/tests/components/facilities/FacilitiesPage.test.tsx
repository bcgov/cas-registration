import { render, screen } from "@testing-library/react";
import getOperation from "@bciers/actions/api/getOperation";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";

vi.mock(
  "@/administration/app/components/facilities/FacilitiesDataGrid",
  () => ({
    __esModule: true,
    default: (props: any) => (
      <div data-testid="facility-datagrid">
        operationId:{props.operationId}
        row_count:{props.initialData?.row_count}
      </div>
    ),
  }),
);

vi.mock("@bciers/actions/api/getOperation", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock(
  "@/administration/app/components/facilities/fetchFacilitiesPageData",
  () => ({
    __esModule: true,
    default: vi.fn(),
  }),
);

describe("FacilitiesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('renders "No facilities data in database." when fetchFacilitiesPageData returns falsy', async () => {
    vi.mocked(fetchFacilitiesPageData).mockResolvedValueOnce(undefined as any);

    const { default: FacilitiesPage } = await import(
      "apps/administration/app/components/facilities/FacilitiesPage"
    );

    render(
      await FacilitiesPage({
        operationId: "not-a-uuid",
        searchParams: {},
      }),
    );

    expect(screen.getByText("No facilities data in database.")).toBeVisible();
    expect(screen.queryByTestId("facility-datagrid")).not.toBeInTheDocument();
  });

  it("renders FacilityDataGrid when facilities are returned", async () => {
    vi.mocked(fetchFacilitiesPageData).mockResolvedValueOnce({
      rows: [],
      row_count: 2,
    } as any);

    const { default: FacilitiesPage } = await import(
      "apps/administration/app/components/facilities/FacilitiesPage"
    );

    render(
      await FacilitiesPage({
        operationId: "not-a-uuid",
        searchParams: {},
      }),
    );

    const grid = screen.getByTestId("facility-datagrid");
    expect(grid).toBeVisible();
    expect(grid).toHaveTextContent("operationId:not-a-uuid");
    expect(grid).toHaveTextContent("row_count:2");
  });

  it("throws when operationId is a valid UUID and getOperation returns an error", async () => {
    vi.mocked(getOperation).mockResolvedValueOnce({ error: "nope" } as any);
    vi.mocked(fetchFacilitiesPageData).mockResolvedValueOnce({
      rows: [],
      row_count: 0,
    } as any);

    const { default: FacilitiesPage } = await import(
      "apps/administration/app/components/facilities/FacilitiesPage"
    );

    await expect(async () => {
      render(
        await FacilitiesPage({
          operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
          searchParams: {},
        }),
      );
    }).rejects.toThrow(
      "We couldn't find your operation information. Please ensure you have been approved for access to this operation.",
    );
  });
});
