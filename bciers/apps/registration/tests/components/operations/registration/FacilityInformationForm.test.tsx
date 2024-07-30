import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession } from "@bciers/testConfig/mocks";
import { facilityInformationSchema } from "@/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the FacilityInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the FacilityInformationForm component", () => {
    render(
      <FacilityInformationForm
        formData={{}}
        operation="create"
        schema={facilityInformationSchema}
        step={3}
        steps={OperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });
});
