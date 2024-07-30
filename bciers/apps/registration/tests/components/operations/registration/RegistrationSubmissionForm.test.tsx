import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession } from "@bciers/testConfig/mocks";
import { submissionSchema } from "@/registration/app/data/jsonSchema/operationRegistration/submission";
import RegistrationSubmissionForm from "apps/registration/app/components/operations/registration/RegistrationSubmissionForm";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the RegistrationSubmissionForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the RegistrationSubmissionForm component", () => {
    render(
      <RegistrationSubmissionForm
        formData={{}}
        operation="create"
        schema={submissionSchema}
        step={2}
        steps={OperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
