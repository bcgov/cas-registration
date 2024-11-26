import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import userEvent from "@testing-library/user-event";
import SelectOperatorForm from "apps/administration/app/components/userOperators/SelectOperatorForm";
import { expectLink } from "@bciers/testConfig/helpers/expectLink";

import { id, operatorLegalName } from "./constants";

const operatorCRA = "123456789";
const radioLegalName = "Search by Business Legal Name";
const radioCRANumber = "Search by Canada Revenue Agency (CRA) Business Number";
const placeHolderLegalName = "Enter Business Legal Name";
const placeHolderCRANumber = "Enter CRA Business Number";
const buttonLegalName = "Select Operator";
const buttonCRANumber = "Search Operator";
const requiredField = "Required field";
const responseLegalName = {
  id: id,
  legal_name: operatorLegalName,
  error: null,
};
const responseError = {
  id: null,
  legal_name: null,
  error: "No matching operator found. Retry or add operator.",
};
const urlPush = `/select-operator/confirm/${id}?title=${operatorLegalName}`;

const mockPush = vi.fn(); // Create a mock function for router.push method
useRouter.mockReturnValue({
  push: mockPush,
});
// ⛏️ Helper function to click the submit button
async function clickSubmitButton(text: string) {
  const submitButton = screen.getByRole("button", { name: text });
  expect(submitButton).toHaveAttribute("type", "submit");
  expect(submitButton).toBeEnabled();
  await act(async () => {
    userEvent.click(submitButton);
  });
}
// ⛏️ Helper function to click radio button search by...
async function selectSearchByCRANumber() {
  // Select Operator by CRA number...
  const radioOperatorCRANumber = screen.getByLabelText(radioCRANumber);
  fireEvent.click(radioOperatorCRANumber);
}
// ⛏️ Helper function to verify required field not found
async function verifyNoRequiredField() {
  // Initially, the form should render without any error messages
  const requiredFieldError = screen.queryByText(requiredField);
  expect(requiredFieldError).not.toBeInTheDocument();
}
// ⛏️ Helper function to verify operator is required
async function verifyRequiredOperator() {
  // Verify the "Required field" error message to appear
  const errorMessages = await screen.findAllByText(requiredField);
  expect(errorMessages[0]).toBeVisible();
  // Ensure that the mockPush function has not been called, indicating no navigation
  expect(mockPush).not.toHaveBeenCalled();
}

describe("Select Operator Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<SelectOperatorForm />);
  });
  it("renders the form correctly", async () => {
    // Verify the radio buttons radio buttons for searching by "Business Legal Name" and "CRA Business Number"
    const radioOperatorLegalName = screen.getByLabelText(radioLegalName);
    const radioOperatorCRANumber = screen.getByLabelText(radioCRANumber);
    expect(radioOperatorLegalName).toBeInTheDocument();
    expect(radioOperatorCRANumber).toBeInTheDocument();

    // Verify the searching default values - legal name
    expect(radioOperatorLegalName).toBeChecked();
    expect(radioOperatorCRANumber).not.toBeChecked();
    expect(
      screen.getByPlaceholderText(placeHolderLegalName),
    ).toBeInTheDocument();
    expect(screen.getByText(buttonLegalName)).toBeInTheDocument();

    // Verify the search_type radio button action changes - cra number
    fireEvent.click(radioOperatorCRANumber);
    expect(
      screen.getByPlaceholderText(placeHolderCRANumber),
    ).toBeInTheDocument();
    expect(screen.getByText(buttonCRANumber)).toBeInTheDocument();
    // Verify the add operator button is available
    expectLink("Add Operator", "/select-operator/add-operator");
  });
  it("selects operator by legal name, submits form, and navigates on success", async () => {
    // Get the search field for entering the operator's legal name
    const searchField = screen.getByPlaceholderText(placeHolderLegalName);
    // Enter text into the search by input field - legal_name
    userEvent.type(searchField, operatorLegalName);
    // Mock the response of the action handler to return the search response array
    actionHandler.mockResolvedValueOnce([responseLegalName]);
    // Wait for the operator's legal name to appear in the dropdown options
    await waitFor(async () => {
      expect(searchField).toHaveValue("Operator");
    });
    await waitFor(async () => {
      expect(screen.getByText(operatorLegalName)).toBeVisible();
    });
    await waitFor(async () => {
      expect(screen.getByText("Operator 1")).toBeVisible();
    });
    // Select the operator from the dropdown
    const operator1 = screen.getByText(operatorLegalName);
    await act(async () => {
      await userEvent.click(operator1);
    });
    // Verify that the search field contains the operator's legal name
    expect(searchField).toHaveValue(operatorLegalName);

    // Mock the actionHandler to return an operator on submit
    actionHandler.mockResolvedValueOnce(responseLegalName);
    // Submit the form
    clickSubmitButton(buttonLegalName);

    // Verify navigation to confirm operator page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(urlPush);
    });
  });
  it("selects operator by cra number, submits form, and navigates on success", async () => {
    // Select Search Operator by CRA number...
    selectSearchByCRANumber();
    // Get the search field for entering the operator's cra number
    const searchField = screen.getByPlaceholderText(placeHolderCRANumber);
    // Enter text into the search by input field - cra_business_number
    await userEvent.type(searchField, operatorCRA);
    // Verify that the search field contains the operator's cra number
    expect(searchField).toHaveValue(Number(operatorCRA));
    // Mock the actionHandler to return an operator on submit
    actionHandler.mockResolvedValueOnce(responseLegalName);
    // Submit the form
    clickSubmitButton(buttonCRANumber);
    // Verify the required field alert is not trigered
    const requiredFieldError = screen.queryByText(requiredField);
    expect(requiredFieldError).not.toBeInTheDocument();
    // Verify navigation to confirm operator page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(urlPush);
    });
  });
  it("shows required field error when legal_name is not provided", async () => {
    // Initially, the form should render without any error messages
    await verifyNoRequiredField();
    // Attempt to submit the form without entering a legal_name
    await clickSubmitButton(buttonLegalName);
    // Verify the "Required field" error message to appear and form is not submited
    await verifyRequiredOperator();
  });
  it("shows required field error when cra number is not provided", async () => {
    // Initially, the form should render without any error messages
    await verifyNoRequiredField();
    // Select Search Operator by CRA number...
    selectSearchByCRANumber();
    // Attempt to submit the form without entering a cra number
    await clickSubmitButton(buttonCRANumber);
    // Verify the "Required field" error message to appear and form is not submited
    await verifyRequiredOperator();
  });
  it("shows error when operator by cra number is not found", async () => {
    // Select Search Operator by CRA number...
    selectSearchByCRANumber();
    // Get the search field for entering the operator's cra number
    const searchField = screen.getByPlaceholderText(placeHolderCRANumber);
    // Enter text into the search by input field - cra_business_number
    await userEvent.type(searchField, operatorCRA);
    // Verify that the search field contains the operator's cra number
    expect(searchField).toHaveValue(Number(operatorCRA));
    // Mock the actionHandler to return an operator on submit
    actionHandler.mockResolvedValueOnce(responseError);
    // Attempt to submit the form without entering a legal_name
    await clickSubmitButton(buttonCRANumber);
    // Assert that the error message is displayed
    expect(await screen.findByText(responseError.error)).toBeInTheDocument();
    // Ensure that the mockPush function has not been called, indicating no navigation
    expect(mockPush).not.toHaveBeenCalled();
  });
});
