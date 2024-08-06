import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSearchParams, useSession } from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

useSearchParams.mockReturnValue({
  searchParams: {
    operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
    operationsTitle: "Test Operation",
    step: 3,
  },
  get: vi.fn(),
});

const defaultProps = {
  formData: {},
  operation: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  step: 3,
  steps: allOperationRegistrationSteps,
  initialGridData: { rows: [], row_count: 0 },
  isOperationSfo: false,
};

describe("the FacilityInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the FacilityInformationForm component", () => {
    render(<FacilityInformationForm {...defaultProps} />);

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });
});
