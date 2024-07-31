import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession } from "@bciers/testConfig/mocks";
import { operationRepresentativeSchema } from "@/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationRepresentativeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OperationRepresentativeForm component", () => {
    render(
      <OperationRepresentativeForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={operationRepresentativeSchema}
        step={3}
        steps={OperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });
});
