import Operations from "@/app/components/routes/operations/Operations";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import createFetchMock from "vitest-fetch-mock";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// Needed to mock all this stuff for server components to work
// Will need to look into making them reusable
vi.mock("next-auth/react", async () => {
  return {
    SessionProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useSession: vi.fn(() => ({
      data: {
        user: {
          app_role: ["cas_admin"],
        },
      },
    })),
  };
});

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(
    () =>
      new Promise((resolve) => {
        resolve({
          user: {
            app_role: "cas_admin",
          },
        });
      }),
  ),
}));

// TODO: Correctly mock cookies to remove stderr warnings
// vi.mock("next/headers", () => ({
//   cookies: vi.fn(),
// }));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => Promise.resolve()),
  revalidatePath: vi.fn(() => Promise.resolve()),
}));

// TODO: Remove skip and fix this test
describe("Operations component", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    fetchMock.resetMocks();
    fetchMock.enableMocks(); // Enable fetch mocking
  });
  it("renders the Operations grid", async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        data: [
          {
            id: "1",
            bc_obps_regulated_operation: "1",
            operator: "1",
            submission_date: "2021-10-01T00:00:00",
            status: "Not Started",
            name: "Operation 1",
            bcghg_id: "1",
          },
          {
            id: "2",
            bc_obps_regulated_operation: "2",
            operator: "2",
            submission_date: "2021-10-01T00:00:00",
            status: "Not Started",
            name: "Operation 2",
            bcghg_id: "2",
          },
        ],
        row_count: 2,
      }),
    );
    render(await Operations());

    // Check if the grid of mock data is present
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.getByText(/Operation 2/i)).toBeVisible();
    // temporarily commented out because render only renders half the grid
    expect(screen.getAllByText(/not Started/i)).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /start registration/i }),
    ).toHaveLength(2);
  });
});
