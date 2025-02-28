import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
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

  const submissionMessage = screen.getByTestId("submission-message");
  expect(submissionMessage).toBeVisible();
  expect(submissionMessage).toHaveTextContent(
    "The Greenhouse Gas Emission Reporting Regulation requires an operator to report the following events:",
  );

  const linkToForm = screen.getByRole("link", { name: "Link to form" });
  expect(linkToForm).toBeVisible();
  expect(linkToForm).toHaveAttribute("href", "https://submit.digital.gov.bc.ca/app/form/submit?f=d26fb011-2846-44ed-9f5c-26e2756a758f");
  expect(screen.getByRole("link", { name: "Back to Dashboard" })).toBeVisible();
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
});
