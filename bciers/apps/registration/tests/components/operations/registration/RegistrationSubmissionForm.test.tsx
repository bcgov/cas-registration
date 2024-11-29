import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";
import { submissionSchema } from "@/registration/app/data/jsonSchema/operationRegistration/submission";
import RegistrationSubmissionForm from "apps/registration/app/components/operations/registration/RegistrationSubmissionForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import { UUID } from "crypto";
import { OperationStatus } from "@bciers/utils/src/enums";

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

const checkAllCheckboxesAndSubmit = async (
  mockResponse = {
    id: "81f62498-3b9d-49b7-961f-739c51b961a9",
    status: OperationStatus.REGISTERED,
  },
) => {
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
  actionHandler.mockResolvedValueOnce(mockResponse);
  act(() => {
    submitButton.click();
  });

  expect(actionHandler).toHaveBeenCalledTimes(1);
};

const verifySuccessPage = async () => {
  await waitFor(() => {
    expect(screen.getByText("Registration complete")).toBeVisible();
  });

  expect(screen.getByRole("alert")).toHaveTextContent(
    "If yes, and you have not reported it yet, please report it in the Report a Change page. Otherwise, no further action is required and this registration is complete.",
  );

  expect(screen.getByRole("link", { name: "Report a change" })).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Return to Dashboard" }),
  ).toBeVisible();
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

  it("should allow the user to mark all checkboxes and submit the form", async () => {
    render(<RegistrationSubmissionForm {...defaultProps} />);

    await checkAllCheckboxesAndSubmit();

    expect(actionHandler).toHaveBeenCalledWith(
      `registration/operations/${defaultProps.operation}/registration/submission`,
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
    render(<RegistrationSubmissionForm {...defaultProps} />);

    await checkAllCheckboxesAndSubmit();

    await verifySuccessPage();
  });

  it("should not render the success page if the operation data is incomplete", async () => {
    render(<RegistrationSubmissionForm {...defaultProps} />);

    await checkAllCheckboxesAndSubmit({
      id: "81f62498-3b9d-49b7-961f-739c51b961a9",
      status: OperationStatus.DRAFT,
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Registration complete"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Before clicking 'Submit'/i)).toBeVisible();
    });
  });

  it("should render the Submission message with the correct years (older date)", async () => {
    // Using old date to show this is working
    const date = new Date(2000, 8, 12);
    vi.setSystemTime(date);

    render(<RegistrationSubmissionForm {...defaultProps} />);

    await checkAllCheckboxesAndSubmit();

    await verifySuccessPage();

    const submissionDateMessage = screen.getByTestId("submission-date-message");
    expect(submissionDateMessage).toHaveTextContent(
      "Did your operation or facility have any of the following changes in 1999 or 2000?",
    );
  });

  it("should render the message with the correct years (recent date)", async () => {
    const newerDate = new Date(2024, 8, 12);
    vi.setSystemTime(newerDate);

    render(<RegistrationSubmissionForm {...defaultProps} />);

    await checkAllCheckboxesAndSubmit();

    await verifySuccessPage();

    const submissionDateMessage = screen.getByTestId("submission-date-message");

    expect(submissionDateMessage).toHaveTextContent(
      "Did your operation or facility have any of the following changes in 2023 or 2024?",
    );
  });

  it("should render the Submission message with the correct years (future date)", async () => {
    const futureDate = new Date(2035, 8, 12);
    vi.setSystemTime(futureDate);

    render(<RegistrationSubmissionForm {...defaultProps} />);

    await checkAllCheckboxesAndSubmit();

    await verifySuccessPage();

    const submissionDateMessage = screen.getByTestId("submission-date-message");

    expect(submissionDateMessage).toHaveTextContent(
      "Did your operation or facility have any of the following changes in 2034 or 2035?",
    );
  });
});
