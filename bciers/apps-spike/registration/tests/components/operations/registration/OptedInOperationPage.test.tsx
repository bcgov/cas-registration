import { render, screen } from "@testing-library/react";
import { describe, it, beforeEach, vi, expect } from "vitest";
import { useSessionRole } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import OptedInOperationPage from "@/registration/app/components/operations/registration/OptedInOperationPage";

// mock the api module used by the page
vi.mock("@bciers/actions/api", () => ({
  getOptedInOperationDetail: vi.fn(),
}));

import { getOptedInOperationDetail } from "@bciers/actions/api";

describe("the OptedInOperationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user_admin");

    // ✅ return *some object* so formData isn't undefined/null
    (
      getOptedInOperationDetail as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
  });

  it("should render the OptedInOperationPage component test", async () => {
    render(
      await OptedInOperationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Opt-In Application",
    );
  });
});
