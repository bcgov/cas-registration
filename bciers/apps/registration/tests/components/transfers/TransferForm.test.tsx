import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UUID } from "crypto";
import { expect } from "vitest";
import expectButton from "@bciers/testConfig/helpers/expectButton";
import expectRadio from "@bciers/testConfig/helpers/expectRadio";
import expectComboBox from "@bciers/testConfig/helpers/expectComboBox";
import {
  actionHandler,
  fetchFacilitiesPageData,
  fetchOperationsPageData,
} from "@bciers/testConfig/mocks";
import TransferForm from "@/registration/app/components/transfers/TransferForm";

const mockOperators = [
  {
    id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063" as UUID,
    legal_name: "Operator 1",
    business_structure: "Corporation",
    cra_business_number: "123456789",
    bc_corporate_registry_number: "123456789",
  },
  {
    id: "8be4c7aa-6ab3-4aad-9206-0ef914fea064" as UUID,
    legal_name: "Operator 2",
    business_structure: "Corporation",
    cra_business_number: "123456789",
    bc_corporate_registry_number: "123456789",
  },
];

const mockOperations = {
  rows: [
    {
      operation__id: "8be4c7aa-6ab3-4aad-9206-0ef914fea065" as UUID,
      operation__name: "Operation 1",
    },
    {
      operation__id: "8be4c7aa-6ab3-4aad-9206-0ef914fea066" as UUID,
      operation__name: "Operation 2",
    },
  ],
  row_count: 2,
};

const renderTransferForm = () => {
  render(<TransferForm formData={{} as any} operators={mockOperators} />);
};

const selectOperator = (label: RegExp, operatorName: string) => {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value: "Operator" },
  });
  fireEvent.click(screen.getByRole("option", { name: operatorName }));
};

const selectEntityAndAssertFields = async (entity: string) => {
  fireEvent.click(screen.getByLabelText(entity));
  if (entity === "Operation") {
    expect(screen.getByLabelText(/operation\*/i)).toBeVisible();
    expect(
      screen.getByLabelText(/effective date of transfer\*/i),
    ).toBeVisible();
  } else if (entity === "Facility") {
    // check field labels
    expect(
      screen.getByLabelText(
        /select the operation that the facility\(s\) currently belongs to\*/i,
      ),
    ).toBeVisible();
    expect(screen.getByLabelText(/facilities\*/i)).toBeVisible();
    expect(
      screen.getByLabelText(
        /select the new operation the facility\(s\) will be allocated to\*/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByLabelText(/effective date of transfer\*/i),
    ).toBeVisible();

    // check field types
    expect(
      screen.getByRole("combobox", {
        name: /select the operation/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("combobox", {
        name: /facilities\*/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByLabelText(
        /select the new operation the facility\(s\) will be allocated to\*/i,
      ),
    ).toBeVisible();
  }
};

const selectOperation = async (label: RegExp, operationName: string) => {
  await waitFor(() => {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: "Operation" },
    });
    expect(
      screen.getByRole("option", { name: operationName }),
    ).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("option", { name: operationName }));
  await waitFor(() =>
    expect(screen.getByLabelText(label)).toHaveValue(operationName),
  );
};

const selectDateOfTransfer = (date: string) => {
  const dateOfTransfer = screen.getByLabelText(/effective date of transfer\*/i);
  expect(dateOfTransfer).toBeVisible();
  fireEvent.change(dateOfTransfer, { target: { value: date } });
  expect(dateOfTransfer).toHaveValue(date);
};

describe("The TransferForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    fetchOperationsPageData.mockResolvedValue(mockOperations);
  });

  it("should render the TransferForm component", async () => {
    renderTransferForm();
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Transfer Entity",
    );
    expect(screen.getByText(/select the operators involved/i)).toBeVisible();
    expectComboBox(/current operator/i);
    expectComboBox(/select the new operator/i);
    expect(screen.getByText(/what is being transferred?/i)).toBeVisible();
    expectRadio(/operation/i);
    expectRadio(/facility/i);
    expectButton("Transfer Entity", false);
    expectButton("Back");
  });

  it("should enable the submit button when the form is valid", async () => {
    renderTransferForm();
    selectOperator(/current operator\*/i, "Operator 1");
    selectOperator(/select the new operator\*/i, "Operator 2");
    await selectEntityAndAssertFields("Operation");
    await selectOperation(/operation\*/i, "Operation 1");
    selectDateOfTransfer("2022-12-31");
    expectButton("Transfer Entity");
  });

  it("displays error when same operator is selected", async () => {
    renderTransferForm();
    selectOperator(/current operator\*/i, "Operator 1");
    selectOperator(/select the new operator\*/i, "Operator 1");
    await selectEntityAndAssertFields("Operation");
    // make sure the operation field is disabled and the error message is displayed
    expect(
      screen.getByText(/cannot transfer an operation to the same operator/i),
    ).toBeVisible();
    expect(screen.getByRole("combobox", { name: /operation/i })).toBeDisabled();
  });

  it("calls fetchOperationsPageData with new operator id when operator changes", async () => {
    renderTransferForm();
    selectOperator(/current operator\*/i, "Operator 1");
    expect(fetchOperationsPageData).toHaveBeenCalledTimes(1);
    expect(fetchOperationsPageData).toHaveBeenCalledWith({
      operator_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      paginate_results: false,
      sort_field: "operation__name",
      sort_order: "asc",
      end_date: true,
      status: "Active",
    });
    selectOperator(/current operator\*/i, "Operator 2");
    expect(fetchOperationsPageData).toHaveBeenCalledTimes(2);
    expect(fetchOperationsPageData).toHaveBeenCalledWith({
      operator_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea064",
      paginate_results: false,
      sort_field: "operation__name",
      sort_order: "asc",
      end_date: true,
      status: "Active",
    });
  });

  it("displays fields related to Facility entity", async () => {
    renderTransferForm();
    selectOperator(/current operator\*/i, "Operator 1");
    selectOperator(/select the new operator\*/i, "Operator 2");
    await selectEntityAndAssertFields("Facility");
  });

  it("fetches facilities when operation changes", async () => {
    renderTransferForm();
    selectOperator(/current operator\*/i, "Operator 1");
    selectOperator(/select the new operator\*/i, "Operator 2");
    await selectEntityAndAssertFields("Facility");
    await selectOperation(
      /select the operation that the facility\(s\) currently belongs to\*/i,
      "Operation 1",
    );
    expect(fetchFacilitiesPageData).toHaveBeenCalledWith(
      "8be4c7aa-6ab3-4aad-9206-0ef914fea065",
      {
        paginate_results: false,
        end_date: true,
        status: "Active",
      },
    );
  });

  it("submits the form and shows success screen", async () => {
    actionHandler.mockResolvedValueOnce({});
    renderTransferForm();
    selectOperator(/current operator\*/i, "Operator 1");
    selectOperator(/select the new operator\*/i, "Operator 2");
    await selectEntityAndAssertFields("Operation");
    await selectOperation(/operation\*/i, "Operation 1");
    selectDateOfTransfer("2022-12-31");
    // submit the form
    const submitButton = screen.getByRole("button", {
      name: /transfer entity/i,
    });
    expect(submitButton).toBeEnabled();
    fireEvent.click(
      screen.getByRole("button", {
        name: /transfer entity/i,
      }),
    );
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/transfer-events",
      "POST",
      "",
      {
        body: JSON.stringify({
          from_operator: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
          to_operator: "8be4c7aa-6ab3-4aad-9206-0ef914fea064",
          transfer_entity: "Operation",
          operation: "8be4c7aa-6ab3-4aad-9206-0ef914fea065",
          effective_date: "2022-12-31T09:00:00.000Z",
        }),
      },
    );
    // make sure the success page is displayed
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /transferred/i }),
      ).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: /return to transfer requests table/i,
        }),
      ).toBeVisible();
    });
  });
});
