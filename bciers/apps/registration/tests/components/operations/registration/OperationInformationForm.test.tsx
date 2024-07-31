import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession } from "@bciers/testConfig/mocks";
import { operationInformationSchema } from "@/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OperationInformationForm component", () => {
    render(
      <OperationInformationForm
        formData={{}}
        operation="create"
        schema={operationInformationSchema}
        step={3}
        steps={OperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
  });
});
