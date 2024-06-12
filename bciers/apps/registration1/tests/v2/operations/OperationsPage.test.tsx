import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import OperationsPage from "apps/registration/app/components/operations/OperationsPage";
import { getServerSession } from "@/tests/mocks";

// we have to mock child server components because react testing library doesn't yet play nice with the new next server components
vi.mock("apps/registration/app/components/operations/Operations", () => {
  return {
    default: () => <div>mocked Operations component</div>,
  };
});

describe("OperationsPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the OperationsPage components for external users", async () => {
    getServerSession.mockReturnValueOnce({
      user: { app_role: "industry_user" },
    });
    render(
      await OperationsPage({
        searchParams: {},
      }),
    );

    expect(
      screen.getByText("View the operations owned by your operator here."),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /operations/i })).toBeVisible();
    expect(
      screen.getByRole("button", { name: /add operation/i }),
    ).toBeVisible();
    expect(screen.getByText("mocked Operations component")).toBeInTheDocument();
  });

  it("renders the OperationsPage components for internal users", async () => {
    getServerSession.mockReturnValueOnce({
      user: { app_role: "cas_analyst" },
    });
    render(
      await OperationsPage({
        searchParams: {},
      }),
    );

    expect(
      screen.getByText(
        "View all the operations, which can be sorted or filtered by operator here.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /operations/i })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /add operation/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("mocked Operations component")).toBeInTheDocument();
  });
});
