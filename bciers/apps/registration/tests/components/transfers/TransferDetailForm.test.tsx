import { render, screen, waitFor } from "@testing-library/react";
import expectButton from "@bciers/testConfig/helpers/expectButton";
import { actionHandler, useRouter, useSession } from "@bciers/testConfig/mocks";
import { fetchOperationsPageData } from "@/administration/tests/components/operations/mocks";
import { fetchFacilitiesPageData } from "@/administration/tests/components/facilities/mocks";
import TransferDetailForm from "@/registration/app/components/transfers/TransferDetailForm";
import { Session } from "@bciers/testConfig/types";
import { randomUUID, UUID } from "crypto";
import {
  facilityEntitySchema,
  operationEntitySchema,
} from "@/registration/app/data/jsonSchema/transfer/transferDetail";
import { TransferEventStatus } from "@/registration/app/components/transfers/enums";
import { ExistingFacilities } from "@/registration/app/components/transfers/types";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import userEvent from "@testing-library/user-event";
import expectComboBox from "@bciers/testConfig/helpers/expectComboBox";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "cas_analyst",
    },
  },
} as Session);

const transferId = randomUUID();

const mockFacilities = {
  rows: [
    {
      facility__id: "8be4c7aa-6ab3-4aad-9206-0ef914fea067" as UUID,
      facility__name: "Name 1",
      facility__latitude_of_largest_emissions: 11.0,
      facility__longitude_of_largest_emissions: 22.0,
    },
    {
      facility__id: "8be4c7aa-6ab3-4aad-9206-0ef914fea068" as UUID,
      facility__name: "Name 2",
      facility__latitude_of_largest_emissions: 33.0,
      facility__longitude_of_largest_emissions: 44.0,
    },
    {
      facility__id: "8be4c7aa-6ab3-4aad-9206-0ef914fea069" as UUID,
      facility__name: "Name 3",
      facility__latitude_of_largest_emissions: 55.0,
      facility__longitude_of_largest_emissions: 66.0,
    },
    {
      facility__id: "8be4c7aa-6ab3-4aad-9206-0ef914fea070" as UUID,
      facility__name: "Name 4",
      facility__latitude_of_largest_emissions: 77.0,
      facility__longitude_of_largest_emissions: 88.0,
    },
  ],
  row_count: 4,
};

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

const operationEntityTransferFormData = {
  from_operator: "Operator 1",
  from_operator_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063" as UUID,
  to_operator: "Operator 2",
  transfer_entity: "Operation",
  operation: "8be4c7aa-6ab3-4aad-9206-0ef914fea065" as UUID,
  operation_name: "Operation 1",
  existing_facilities: [],
  effective_date: "2022-12-31",
  status: TransferEventStatus.TO_BE_TRANSFERRED,
};

const facilityEntityTransferFormData = {
  from_operator: "Operator 1",
  from_operator_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063" as UUID,
  to_operator: "Operator 2",
  transfer_entity: "Facility",
  from_operation: "Operation 1",
  from_operation_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea065" as UUID,
  to_operation: "Operation 2",
  facilities: [
    "8be4c7aa-6ab3-4aad-9206-0ef914fea067" as UUID,
    "8be4c7aa-6ab3-4aad-9206-0ef914fea068" as UUID,
  ],
  existing_facilities: [
    {
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea067" as UUID,
      name: "Name 1 - (11, 22)",
    },
    {
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea068" as UUID,
      name: "Name 2 - (33, 44)",
    },
  ] as ExistingFacilities[],
  effective_date: "2022-12-31",
  status: TransferEventStatus.TO_BE_TRANSFERRED,
};

const renderOperationEntityTransferDetailForm = async (
  formData: any = operationEntityTransferFormData,
) => {
  fetchOperationsPageData.mockResolvedValue(mockOperations);
  const schema = await operationEntitySchema(
    formData.operation,
    formData.operation_name,
    formData.from_operator_id,
  );
  render(
    <TransferDetailForm
      formData={formData}
      transferId={transferId}
      schema={schema}
    />,
  );
};

const renderFacilityEntityTransferDetailForm = async () => {
  fetchFacilitiesPageData.mockResolvedValue(mockFacilities);
  const schema = await facilityEntitySchema(
    facilityEntityTransferFormData.existing_facilities,
    facilityEntityTransferFormData.from_operator_id,
  );
  render(
    <TransferDetailForm
      formData={facilityEntityTransferFormData}
      transferId={transferId}
      schema={schema}
    />,
  );
};

const checkButtons = (editable: boolean = true) => {
  expectButton("Back");
  if (editable) {
    expectButton("Edit Details");
    expectButton("Cancel Transfer");
  } else {
    expect(screen.queryByRole("button", { name: /edit details/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /cancel transfer/i }),
    ).toBeNull();
  }
};

const checkFormFieldsAndLabels = (fields: string[]) => {
  fields.forEach((field: string) => {
    const fieldRegex = new RegExp(field, "i");
    expect(screen.getByText(fieldRegex)).toBeVisible();
  });
};

describe("The TransferDetailForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("should render the TransferDetailForm component for an operation entity transfer", async () => {
    await renderOperationEntityTransferDetailForm();
    const formFieldsAndLabels = [
      "current operator",
      "operator 1",
      "new operator",
      "operator 2",
      "what is being transferred?",
      "operation 1",
      "effective date of transfer",
      "2022-12-31",
    ];
    checkFormFieldsAndLabels(formFieldsAndLabels);
    checkButtons();
  });

  it("should render the TransferDetailForm component for a facility entity transfer", async () => {
    await renderFacilityEntityTransferDetailForm();
    const formFieldsAndLabels = [
      "current operator",
      "operator 1",
      "new operator",
      "operator 2",
      "what is being transferred?",
      "facility",
      "current operation",
      "operation 1",
      "facilities",
      "name 1 - \\(11, 22\\), name 2 - \\(33, 44\\)",
      "new operation",
      "effective date of transfer",
      "2022-12-31",
    ];

    checkFormFieldsAndLabels(formFieldsAndLabels);
    checkButtons();
  });

  it("should not render the edit details and cancel transfer buttons when the transfer status is not TO_BE_TRANSFERRED", async () => {
    const modifiedFormData = {
      ...operationEntityTransferFormData,
      status: TransferEventStatus.COMPLETE,
    };
    await renderOperationEntityTransferDetailForm(modifiedFormData);
    checkButtons(false);
  });

  it("should take the user back to the transfer requests table when the back button is clicked", async () => {
    await renderOperationEntityTransferDetailForm();
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockRouterPush).toHaveBeenCalledWith("/transfers");
  });

  it("should allow the user to cancel the transfer", async () => {
    await renderOperationEntityTransferDetailForm();
    await userEvent.click(
      screen.getByRole("button", { name: /cancel transfer/i }),
    );
    // make sure the modal is displayed
    expect(
      screen.getByRole("heading", {
        name: /confirmation/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/are you sure you want to cancel this transfer\?/i),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: /no, don't cancel/i,
      }),
    ).toBeVisible();
    expect(screen.getByText(/yes, cancel this transfer/i)).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: /yes, cancel this transfer/i }),
    );
    // make sure the action is called
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/transfer-events/${transferId}`,
      "DELETE",
      "/transfers",
    );
    // make sure the user is redirected to the transfers table
    expect(mockRouterPush).toHaveBeenCalledWith("/transfers");
  });

  it("should allow the user to edit the details of the transfer - Operation Entity", async () => {
    actionHandler.mockResolvedValueOnce({}); // to handle the PATCH request response
    fetchOperationsPageData.mockResolvedValue(mockOperations);
    await renderOperationEntityTransferDetailForm();
    await userEvent.click(
      screen.getByRole("button", { name: /edit details/i }),
    );
    expectComboBox(/operation\*/i, "Operation 1");
    await userEvent.type(
      screen.getByRole("combobox", { name: /operation\*/i }),
      "op",
    );

    // make sure the current operation is displayed in the options
    await waitFor(() => {
      expect(
        screen.getByRole("option", {
          name: /operation 1/i,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("option", {
          name: /operation 2/i,
        }),
      ).toBeVisible();
    });
    await userEvent.click(screen.getByText(/operation 2/i));
    expectComboBox(/operation\*/i, "Operation 2");
    expect(
      screen.getByRole("textbox", { name: /effective date of transfer/i }),
    ).toHaveValue("2022-12-31");

    // submit the form
    await userEvent.click(
      screen.getByRole("button", { name: /transfer entity/i }),
    );
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/transfer-events/${transferId}`,
      "PATCH",
      `/transfers/${transferId}`,
      {
        body: JSON.stringify({
          from_operator: "Operator 1",
          to_operator: "Operator 2",
          transfer_entity: "Operation",
          effective_date: "2022-12-31",
          operation: "8be4c7aa-6ab3-4aad-9206-0ef914fea066",
        }),
      },
    );
    // make sure the snackbar is displayed
    expect(
      screen.getByText(/all changes have been successfully saved/i),
    ).toBeVisible();
  });

  it("should allow the user to edit the details of the transfer - Facility Entity", async () => {
    actionHandler.mockResolvedValueOnce({}); // to handle the PATCH request response
    await renderFacilityEntityTransferDetailForm();
    await userEvent.click(
      screen.getByRole("button", { name: /edit details/i }),
    );

    // make sure existing facilities are displayed and included when editing the form
    expect(
      screen.getByRole("button", {
        name: /name 1 \- \(11, 22\)/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: /name 2 \- \(33, 44\)/i,
      }),
    ).toBeVisible();

    // make sure the existing facilities are displayed in the options
    await userEvent.click(
      screen.getByRole("combobox", { name: /facilities/i }),
    );
    const options = [
      "Name 1 - (11, 22)",
      "Name 2 - (33, 44)",
      "Name 3 - (55, 66)",
      "Name 4 - (77, 88)",
    ];
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeVisible();
    });

    // add the last facility
    await userEvent.click(screen.getByText("Name 4 - (77, 88)"));

    // make sure the facility is added to the list
    expect(screen.getByText("Name 4 - (77, 88)")).toBeVisible();

    // submit the form
    await userEvent.click(
      screen.getByRole("button", { name: /transfer entity/i }),
    );
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/transfer-events/${transferId}`,
      "PATCH",
      `/transfers/${transferId}`,
      {
        body: JSON.stringify({
          from_operator: "Operator 1",
          to_operator: "Operator 2",
          transfer_entity: "Facility",
          effective_date: "2022-12-31",
          from_operation: "Operation 1",
          facilities: [
            "8be4c7aa-6ab3-4aad-9206-0ef914fea067",
            "8be4c7aa-6ab3-4aad-9206-0ef914fea068",
            "8be4c7aa-6ab3-4aad-9206-0ef914fea070",
          ],
          to_operation: "Operation 2",
        }),
      },
    );

    // make sure the snackbar is displayed
    expect(
      screen.getByText(/all changes have been successfully saved/i),
    ).toBeVisible();
  });

  it("should not render the edit details and cancel transfer buttons for a user with a role other than CAS_ANALYST", async () => {
    const userAppRole = FrontEndRoles.CAS_ADMIN;
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: userAppRole,
        },
      },
    } as Session);
    await renderOperationEntityTransferDetailForm();
    checkButtons(false);
  });
});
