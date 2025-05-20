/**
 * @file ChangeReviewForm.test.tsx
 * @description
 * Tests for the ChangeReviewForm component:
 *  - Rendering of initial fields and labels
 *  - Form field count and value updates
 *  - Validation and submission flow
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { beforeEach, vi } from "vitest";
import ChangeReviewForm from "@reporting/src/app/components/changeReview/ChangeReviewForm";

// A sample valid navigationInformation object for all tests
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";

// -- Mock setup --------------------------------------------------------------

// Mock out the actionHandler so we can control its resolved value
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

// Mock Next.js router hooks (we only need `push` and `refresh` here)
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Grab typed references to our mocks
const mockPush = vi.fn();
const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = actionHandler as vi.MockedFunction<
  typeof actionHandler
>;

// A constant versionId for simplicity
const mockVersionId = 1;

describe("ChangeReviewForm Component", () => {
  // Before each test, reset mocks to a known state
  beforeEach(() => {
    // useRouter() will return an object with push() and refresh()
    mockUseRouter.mockReturnValue({ push: mockPush, refresh: vi.fn() });
    // By default, pretend actionHandler succeeds
    mockActionHandler.mockResolvedValue({ success: true });
  });

  // After each test, clear all mock call history
  afterEach(() => vi.clearAllMocks());

  it("renders form with correct initial fields", async () => {
    render(
      <ChangeReviewForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    // The schema label "Reason for Edits" should appear in the document
    expect(await screen.findByText("Reason for Edits")).toBeInTheDocument();
  });

  it("renders all expected form fields", async () => {
    render(
      <ChangeReviewForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    // Because our JSON schema only has one text input, we expect exactly one <input role="textbox">
    const inputs = await screen.findAllByRole("textbox");
    expect(inputs).toHaveLength(1);
  });

  it("updates formData when form input changes", () => {
    render(
      <ChangeReviewForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    // Grab the textarea/input by its label text
    const input = screen.getByLabelText(
      /Please explain the reason for submitting this supplementary report/i,
    );

    // Simulate user typing
    fireEvent.change(input, { target: { value: "Mistakes are learning" } });

    // The input's value should now reflect what we typed
    expect(input).toHaveValue("Mistakes are learning");
  });

  it("submits form data and handles success", async () => {
    // Override continueUrl so we can assert push("/next-page")
    render(
      <ChangeReviewForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={{
          ...dummyNavigationInformation,
          continueUrl: "/next-page",
        }}
      />,
    );

    // Find the primary submit button by its visible text
    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });
    expect(submitButton).toBeInTheDocument();

    // Click without filling in required field → validation error appears
    fireEvent.click(submitButton);
    expect(screen.getAllByText(/^.* is required/i)).toHaveLength(1);

    // Fill in the required field
    const input = screen.getByLabelText(
      /Please explain the reason for submitting this supplementary report/i,
    );
    fireEvent.change(input, { target: { value: "Mistakes are learning" } });

    // Click again to submit valid data
    fireEvent.click(submitButton);

    // Wait for the router.push to fire with our continueUrl
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/next-page");
    });
  });
});
