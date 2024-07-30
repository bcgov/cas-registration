import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession } from "@bciers/testConfig/mocks";
import { newEntrantOperationSchema } from "@/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import NewEntrantOperationForm from "apps/registration/app/components/operations/registration/NewEntrantOperationForm";
import { OperationRegistrationNewEntrantSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the NewEntrantOperationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the NewEntrantOperationForm component", () => {
    render(
      <NewEntrantOperationForm
        formData={{}}
        operation="create"
        schema={newEntrantOperationSchema}
        step={4}
        steps={OperationRegistrationNewEntrantSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );
  });
});
