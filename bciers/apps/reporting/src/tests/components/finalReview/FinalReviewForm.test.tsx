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

  it("displays a message when no data is provided", () => {
    render(
      <FinalReviewForm
        navigationInformation={
          {
            headerSteps: [],
            taskList: [],
            backUrl: "back",
            continueUrl: "continue",
          } as any
        }
        data={[]}
      />,
    );
    expect(
      screen.getByText(
        "The system is unable to display a large amount of facility reports at this time, this issue will be fixed in a future version of the system.",
      ),
    ).toBeInTheDocument();
  });
  it("doesn't display a message when data is provided", () => {
    render(
      <FinalReviewForm
        navigationInformation={
          {
            headerSteps: [],
            taskList: [],
            backUrl: "back",
            continueUrl: "continue",
          } as any
        }
        data={[
          {
            schema: {},
            uiSchema: {},
            data: {},
          },
        ]}
      />,
    );
    expect(
      screen.queryByText(
        "The system is unable to display a large amount of facility reports at this time, this issue will be fixed in a future version of the system.",
      ),
    ).not.toBeInTheDocument();
  });
  it("routes back when the back button is clicked", () => {
    const expectedRoute = "back";

    render(
      <FinalReviewForm
        navigationInformation={
          {
            headerSteps: [],
            taskList: [],
            backUrl: "back",
            continueUrl: "continue",
          } as any
        }
        data={[]}
      />,
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
  it("routes forward when the submit button is clicked", () => {
    const expectedRoute = "continue";

    render(
      <FinalReviewForm
        navigationInformation={
          {
            headerSteps: [],
            taskList: [],
            backUrl: "back",
            continueUrl: "continue",
          } as any
        }
        data={[]}
      />,
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
