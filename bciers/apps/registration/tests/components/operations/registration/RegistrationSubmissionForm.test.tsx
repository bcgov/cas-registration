import { act, render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";
import { submissionSchema } from "@/registration/app/data/jsonSchema/operationRegistration/submission";
import RegistrationSubmissionForm from "apps/registration/app/components/operations/registration/RegistrationSubmissionForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import { UUID } from "crypto";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user",
    },
  },
});

const acknowledgementOfReviewRegex =
  /i certify that i have reviewed the registration, and that i have exercised due diligence to ensure that the information included in the registration is true and complete\./i;

const acknowledgementOfRecordsRegex =
  /i understand that the ministry responsible for the administration and enforcement of the greenhouse gas industrial reporting and control act may require records from the operator evidencing the truth of this registration\./i;

const acknowledgementOfInformationRegex =
  /i understand that this information is being collected for the purpose of registration of the operation under greenhouse gas industrial reporting and control act and may be disclosed to the ministry responsible for the administration and enforcement of the carbon tax act\./i;

const defaultProps = {
  formData: {},
  operation: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  step: allOperationRegistrationSteps.length,
  steps: allOperationRegistrationSteps,
  schema: submissionSchema,
};

describe("the RegistrationSubmissionForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the RegistrationSubmissionForm component", () => {
    render(<RegistrationSubmissionForm {...defaultProps} />);

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
    expect(screen.getByText(acknowledgementOfReviewRegex)).toBeInTheDocument();
    expect(screen.getByText(acknowledgementOfRecordsRegex)).toBeInTheDocument();
    expect(
      screen.getByText(acknowledgementOfInformationRegex),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /submit/i,
      }),
    ).toBeDisabled();
  });
  it("should allow the user to mark all checkboxes and submit the form", () => {
    render(<RegistrationSubmissionForm {...defaultProps} />);

    expect(
      screen.getByRole("button", {
        name: /submit/i,
      }),
    ).toBeDisabled();

    act(() => {
      // click all checkboxes
      screen.getAllByRole("checkbox").forEach((checkbox) => {
        checkbox.click();
      });
    });

    const submitButton = screen.getByRole("button", {
      name: /submit/i,
    });
    expect(submitButton).not.toBeDisabled();
    actionHandler.mockResolvedValueOnce({});
    act(() => {
      submitButton.click();
    });
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/v2/operations/${defaultProps.operation}/registration/submission`,
      "PATCH",
      "",
      {
        body: JSON.stringify({
          acknowledgement_of_review: true,
          acknowledgement_of_records: true,
          acknowledgement_of_information: true,
        }),
      },
    );
  });

  it("should render the Submission component when the form is submitted", async () => {
    render(
      <RegistrationSubmissionForm
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={submissionSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      submitButton.click();
    });

    expect(screen.getByText("Registration complete")).toBeVisible();
    expect(
      screen.getByText("This operation has been registered"),
    ).toBeVisible();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "If yes, and you have not reported it yet, please report it in the Report a Change page. Otherwise, no further action is required and this registration is complete.",
    );

    expect(screen.getByRole("link", { name: "Report a change" })).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Return to Dashboard" }),
    ).toBeVisible();
  });

  it("should render the Submission message with the correct years (older date)", async () => {
    render(
      <RegistrationSubmissionForm
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={submissionSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );

    // Using old date to show this is working
    const date = new Date(2000, 8, 12);

    vi.useFakeTimers();
    vi.setSystemTime(date);

    expect(Date.now()).toBe(date.valueOf());

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      submitButton.click();
    });

    const submissionDateMessage = screen.getByTestId("submission-date-message");
    expect(submissionDateMessage).toHaveTextContent(
      "Did your operation or facility have any of the following changes in 1999 or 2000?",
    );
    vi.useRealTimers();
  });

  it("should render the message with the correct years (recent date)", async () => {
    render(
      <RegistrationSubmissionForm
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={submissionSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      submitButton.click();
    });

    const submissionDateMessage = screen.getByTestId("submission-date-message");
    const newerDate = new Date(2024, 8, 12);
    vi.useFakeTimers();
    vi.setSystemTime(newerDate);

    expect(submissionDateMessage).toHaveTextContent(
      "Did your operation or facility have any of the following changes in 2023 or 2024?",
    );
    vi.useRealTimers();
  });
});
