import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSessionRole } from "@bciers/testConfig/mocks";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSessionRole.mockReturnValue("industry_user_admin");

describe("the OperationRepresentativeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OperationRepresentativeForm component with continue button disabled", async () => {
    render(
      <OperationRepresentativeForm
        existingOperationRepresentatives={[]}
        contacts={[]}
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
    // button is disabled when there are no existing operation representatives
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /back/i })).toBeVisible();
  });

  it("should render the OperationRepresentativeForm component with continue button enabled", async () => {
    render(
      <OperationRepresentativeForm
        existingOperationRepresentatives={[
          {
            id: 1,
            full_name: "Existing contact 1",
          },
        ]}
        contacts={[]}
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );

    // Shows the NewOperationRepresentativeForm component passed as beforeForm prop
    expect(
      screen.getByRole("button", {
        name: /add new operation representative/i,
      }),
    ).toBeVisible();

    // button is disabled when there are no existing operation representatives
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /back/i })).toBeVisible();
  });
});
