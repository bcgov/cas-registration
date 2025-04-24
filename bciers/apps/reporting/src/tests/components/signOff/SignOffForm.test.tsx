import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SignOffForm from "@reporting/src/app/components/signOff/SignOffForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";

const mockSchema = {
  type: "object",
  properties: {
    acknowledgement_of_review: {
      type: "boolean",
      title:
        "I certify that I have reviewed the annual report, and that I have exercised due diligence to ensure that the information included in this report is true and complete.",
      default: false,
    },
    acknowledgement_of_records: {
      type: "boolean",
      title:
        "I understand that the Ministry responsible for the administration and enforcement of the Greenhouse Gas Industrial Reporting and Control Act may require records from the Operator evidencing the truth of this report.",
      default: false,
    },
    acknowledgement_of_information: {
      type: "boolean",
      title:
        "I understand that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
      default: false,
    },
    acknowledgement_of_errors: {
      type: "boolean",
      title:
        "I understand that the information provided in this report will impact the compliance obligation of this operation and that any errors, omissions, or misstatements can lead to an additional compliance obligation or administrative penalties.",
      default: false,
    },
    signature: {
      type: "string",
      format: "signature",
      title: "Enter your full name here",
    },
    date: {
      type: "string",
      title: "Date signed",
    },
  },
};

// ⛏️ Helper function to render the form
const renderSignOffForm = () => {
  render(
    <SignOffForm
      version_id={1}
      navigationInformation={dummyNavigationInformation}
      isSupplementaryReport={false}
      isRegulatedOperation={true}
      schema={mockSchema}
    />,
  );
};

describe("SignOffForm Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useRouter.mockReturnValue({
      refresh: vi.fn(),
    });
  });

  it("renders the form with the correct text and fields", async () => {
    renderSignOffForm();

    // Check for the presence of the important texts
    const texts = [
      "I certify that I have reviewed the annual report, and that I have exercised due diligence to ensure that the information included in this report is true and complete.",
      "I understand that the Ministry responsible for the administration and enforcement of the Greenhouse Gas Industrial Reporting and Control Act may require records from the Operator evidencing the truth of this report.",
      "I understand that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
      "I understand that the information provided in this report will impact the compliance obligation of this operation and that any errors, omissions, or misstatements can lead to an additional compliance obligation or administrative penalties.",
    ];

    texts.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText("Enter your full name here"),
    ).toBeInTheDocument();
    expect(screen.getByText("Submit Report")).toBeInTheDocument();
  });

  it("enables the submit button when all checkboxes are checked and the signature is filled", async () => {
    renderSignOffForm();

    // Identify checkboxes and simulate user interactions
    const checkboxes = [
      "I certify that I have reviewed the annual report",
      "I understand that the Ministry responsible for the administration and enforcement",
      "I understand that this information is being collected",
      "I understand that the information provided in this report will impact the compliance obligation",
    ];

    for (const checkboxLabel of checkboxes) {
      const checkbox = screen.getByRole("checkbox", {
        name: new RegExp(checkboxLabel, "i"),
      });
      fireEvent.click(checkbox);
    }

    const signatureField = screen.getByPlaceholderText(
      "Enter your full name here",
    );
    fireEvent.change(signatureField, { target: { value: "John Doe" } });

    const submitButton = screen.getByText(/submit report/i);

    // Wait for the submit button to become enabled
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it("disables the submit button initially", () => {
    renderSignOffForm();
    const submitButton = screen.getByText(/submit report/i);
    expect(submitButton).toBeDisabled();
  });

  it("toggles the checkbox state when clicked", () => {
    renderSignOffForm();

    const reviewCheckbox = screen.getByRole("checkbox", {
      name: /i certify that i have reviewed the annual report/i,
    });

    // Initially, the checkbox should be unchecked
    expect(reviewCheckbox).not.toBeChecked();

    // Click the checkbox to check it
    fireEvent.click(reviewCheckbox);
    expect(reviewCheckbox).toBeChecked();

    // Click again to uncheck it
    fireEvent.click(reviewCheckbox);
    expect(reviewCheckbox).not.toBeChecked();
  });
});
