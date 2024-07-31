import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession } from "@bciers/testConfig/mocks";
import { registrationPurposeSchema } from "@/registration/app/data/jsonSchema/operationRegistration/registrationPurpose";
import RegistrationPurposeForm from "apps/registration/app/components/operations/registration/RegistrationPurposeForm";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the RegistrationPurposeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the RegistrationPurposeForm component", () => {
    render(
      <RegistrationPurposeForm
        formData={{}}
        operation="create"
        schema={registrationPurposeSchema}
        step={2}
        steps={OperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Registration Purpose",
    );
  });
});
