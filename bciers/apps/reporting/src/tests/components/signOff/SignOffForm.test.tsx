import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SignOffForm from "@reporting/src/app/components/signOff/SignOffForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";

// ⛏️ Helper function to render the form
const renderSignOffForm = () => {
  render(
    <SignOffForm
      version_id={1}
      navigationInformation={dummyNavigationInformation}
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

  it("renders the form with correct fields and values", async () => {
    renderSignOffForm();
    expect(
      screen.getByText(
        "I certify that I have reviewed the annual report, and that I have exercised due diligence to ensure that the information included in this report is true and complete.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "I understand that the Ministry responsible for the administration and enforcement of the Greenhouse Gas Industrial Reporting and Control Act may require records from the Operator evidencing the truth of this report.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "I understand that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "I understand that the information provided in this report will impact the compliance obligation of this operation and that any errors, omissions, or misstatements can lead to an additional compliance obligation or administrative penalties.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your full name here"),
    ).toBeInTheDocument();
    expect(screen.getByText("Submit Report")).toBeInTheDocument();
  });

  it("enables the submit button when all checkboxes are checked", () => {
    renderSignOffForm();

    // Identify all the checkbox fields based on their titles
    const reviewCheckbox = screen.getByRole("checkbox", {
      name: /i certify that i have reviewed the annual report/i,
    });
    const recordsCheckbox = screen.getByRole("checkbox", {
      name: /i understand that the ministry responsible for the administration and enforcement/i,
    });
    const informationCheckbox = screen.getByRole("checkbox", {
      name: /i understand that this information is being collected/i,
    });
    const information2Checkbox = screen.getByRole("checkbox", {
      name: /i understand that the information provided in this report will impact the compliance obligation/i,
    });

    // Simulate checking all the checkboxes
    fireEvent.click(reviewCheckbox);
    fireEvent.click(recordsCheckbox);
    fireEvent.click(informationCheckbox);
    fireEvent.click(information2Checkbox);
    const signatureField = screen.getByPlaceholderText(
      "Enter your full name here",
    );
    fireEvent.change(signatureField, { target: { value: "John Doe" } });

    // Check that the submit button is enabled
    const submitButton = screen.getByText(/submit report/i);
    expect(submitButton).not.toBeDisabled();
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

    // Click the checkbox
    fireEvent.click(reviewCheckbox);

    // Now the checkbox should be checked
    expect(reviewCheckbox).toBeChecked();

    // Click again to uncheck
    fireEvent.click(reviewCheckbox);
    expect(reviewCheckbox).not.toBeChecked();
  });
});
