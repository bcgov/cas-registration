import { render, screen } from "@testing-library/react";
import {
  getUserOperatorsPageData,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import UserOperatorsPage from "@/administration/app/components/userOperators/UserOperatorsPage";
import { expect } from "vitest";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock(
  "@/administration/app/components/userOperators/getUserOperatorsPageData",
  () => ({
    default: getUserOperatorsPageData,
  }),
);

describe("User Operators (External Access Requests) Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders UserOperatorsPage with the note on top of the page", async () => {
    getUserOperatorsPageData.mockReturnValueOnce({
      data: [],
      row_count: 0,
    });
    render(await UserOperatorsPage({ searchParams: {} }));
    expect(screen.getByTestId("note")).toBeVisible();
    expect(
      screen.getByText(
        /once "approved", the user will have access to their operator dashboard with full admin permissions,and can grant access and designate permissions to other authorized users there\./i,
      ),
    ).toBeVisible();
    expect(screen.queryByRole("grid")).toBeInTheDocument();
    expect(screen.getByText(/No records found/i)).toBeVisible();
  });
  it("renders the appropriate error component when getUserOperatorsPageData fails", async () => {
    getUserOperatorsPageData.mockReturnValueOnce(undefined);
    expect(async () =>
      render(await UserOperatorsPage({ searchParams: {} })),
    ).rejects.toThrow("Failed to retrieve admin requests.");
  });
});
