import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import {
  useRouter,
  useSearchParams,
  useSessionRole,
} from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSessionRole.mockReturnValue("industry_user_admin");

useSearchParams.mockReturnValue({
  searchParams: {
    operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
    operations_title: "Test Operation",
    step: 2,
  },
  get: vi.fn(),
});

const mockPush = vi.fn();

useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const defaultProps = {
  operationId: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  operationName: "Vitest Operation",
  formData: {},
  step: 2,
  steps: allOperationRegistrationSteps,
  initialGridData: { rows: [], row_count: 0 },
  isCreating: true,
  isOperationSfo: false,
};

describe("the FacilityInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the SFO FacilityInformationForm component", () => {
    render(
      <FacilityInformationForm
        {...{ ...defaultProps, isOperationSfo: true }}
      />,
    );
    expect(
      screen.queryByRole("button", {
        name: "Add New Facility",
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("should render the LFO FacilityInformationForm component", () => {
    render(<FacilityInformationForm {...defaultProps} />);
    expect(
      screen.getByText("Facility Information", {
        selector: "div.form-heading",
      }),
    ).toBeVisible();

    expect(
      screen.getByRole("button", {
        name: "Add New Facility",
      }),
    ).toBeVisible();

    expect(screen.getByRole("grid")).toBeVisible();
  });
});
