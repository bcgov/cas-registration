import { render, screen } from "@testing-library/react";
import InternalAccessRequestsPage from "apps/administration/app/components/users/InternalAccessRequestsPage";

// mocking the child component until this issue is fixed: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612
vi.mock(
  "apps/administration/app/components/users/InternalAccessRequests",
  () => {
    return {
      default: () => <div>mocked child component</div>,
    };
  },
);

describe("Internal Access Requests Page", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders Internal Access Requests Page", () => {
    render(InternalAccessRequestsPage());
    expect(screen.getByText(/Users/i)).toBeVisible();
  });
});
