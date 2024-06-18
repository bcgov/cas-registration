import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { getServerSession } from "@bciers/testConfig/mocks";
import Page from "../../src/app/components/routes/operations/Page";

// we have to mock child server components because react testing library doesn't yet play nice with the new next server components
//vi.mock("apps/registration/app/components/operations/Operations", () => {
//  return {
//    default: () => <div>mocked Operations component</div>,
//  };
//});

describe("OperationsPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the Operations table for the user", async () => {
    getServerSession.mockReturnValueOnce({
      user: { app_role: "industry_user" },
    });
    render(await Page({}));

    expect(screen.getByText("BC GHG ID")).toBeVisible();
    expect(screen.getByText("Operation")).toBeVisible();
    expect(screen.getByText("Action")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "B.C. Industrial Emissions Reporting System (BCIERS)",
      }),
    ).toBeVisible();
  });
});
