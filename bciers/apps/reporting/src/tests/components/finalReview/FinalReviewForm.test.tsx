import { useRouter } from "@bciers/testConfig/mocks";
import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";
import { fireEvent, render, screen } from "@testing-library/react";

// ✨ Mocks
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

describe("The FinalReviewForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes to the compliance summary page when the back button is clicked", () => {
    const expectedRoute = `/reports/12345/compliance-summary`;

    render(
      <FinalReviewForm taskListElements={[]} version_id={12345} data={[]} />,
    );

    // Click the "Back" button
    const backButton = screen.getByRole("button", {
      name: "Back",
    });
    fireEvent.click(backButton);

    // Assert that the router's push method was called with the expected route
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(expectedRoute);
  });
  it("routes to the verification page when the submit button is clicked", () => {
    const expectedRoute = `/reports/12345/verification`;

    render(
      <FinalReviewForm taskListElements={[]} version_id={12345} data={[]} />,
    );

    // Click the "Save and continue" button
    const button = screen.getByRole("button", {
      name: "Continue",
    });
    fireEvent.click(button);

    // Assert that the router's push method was called with the expected route
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(expectedRoute);
  });
});
