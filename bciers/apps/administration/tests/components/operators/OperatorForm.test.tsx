import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actionHandler, useSession, useRouter } from "@bciers/testConfig/mocks";

import { operatorSchema } from "apps/administration/app/data/jsonSchema/operator";
import OperatorForm from "apps/administration/app/components/operators/OperatorForm";
import { createOperatorSchema } from "apps/administration/app/components/operators/OperatorPage";

import expectButton from "@bciers/testConfig/helpers/expectButton";
import expectField from "@bciers/testConfig/helpers/expectField";
import expectHeader from "@bciers/testConfig/helpers/expectHeader";
import { mockUseSession } from "@bciers/testConfig/helpers/mockUseSession";

import { FrontendMessages } from "@bciers/utils/src/enums";

useSession.mockReturnValue({
  get: vi.fn(),
});

const mockReplace = vi.fn();
const mockRouterBack = vi.fn();
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
  back: mockRouterBack,
  push: mockRouterPush,
});

const operatorFormData = {
  street_address: "123 Main St",
  municipality: "City",
  province: "ON",
  postal_code: "A1B 2C3",
  operator_has_parent_operators: true,
  parent_operators_array: [
    {
      po_legal_name: "Parent Operator Legal Name",
      po_cra_business_number: 123456780,
      po_street_address: "789 Oak St",
      po_municipality: "Village",
      po_province: "BC",
      po_postal_code: "M2N 3P4",
      operator_registered_in_canada: true,
      po_mailing_address: 11,
      foreign_address: null,
      foreign_tax_id_number: null,
      id: 1,
    },
    {
      po_legal_name: "Foreign company",
      po_cra_business_number: null,
      po_street_address: null,
      po_municipality: null,
      po_province: null,
      po_postal_code: null,
      operator_registered_in_canada: false,
      po_mailing_address: null,
      foreign_address: "f address",
      foreign_tax_id_number: "f id number",
      id: 2,
    },
  ],
  partner_operators_array: [
    {
      partner_legal_name: "Partner Operator Legal Name",
      partner_trade_name: "Partner Operator Trade Name",
      partner_cra_business_number: 123456780,
      partner_bc_corporate_registry_number: "zzz1212121",
      partner_business_structure: "General Partnership",
      id: 1,
    },
  ],
  id: "4242ea9d-b917-4129-93c2-db00b7451051",
  legal_name: "Existing Operator 2 Legal Name",
  trade_name: "Existing Operator 2 Trade Name",
  business_structure: "General Partnership",
  cra_business_number: 987654321,
  bc_corporate_registry_number: "def1234567",
  mailing_address: 5,
};

const testSchema = createOperatorSchema(operatorSchema, [
  { name: "General Partnership" },
  { name: "BC Corporation" },
  { name: "Extra Provincially Registered Company" },
  { name: "Sole Proprietorship" },
  { name: "Limited Liability Partnership" },
  { name: "BC Incorporated Society" },
  { name: "Extraprovincial Non-Share Corporation" },
]);

const formHeaders: string[] = [
  "Operator Information",
  "Operator Address",
  "Parent Company Information",
];

const formFields: string[] = [
  "Legal Name",
  "Trade Name",
  "Business Structure",
  "BC Corporate Registry Number",
  "Business Mailing Address",
  "Municipality",
  "Province",
  "Postal Code",
];

const postMandatory = {
  legal_name: operatorFormData.legal_name,
  business_structure: "BC Corporation",
  cra_business_number: operatorFormData.cra_business_number,
  bc_corporate_registry_number: operatorFormData.bc_corporate_registry_number,
  street_address: operatorFormData.street_address,
  municipality: operatorFormData.municipality,
  province: operatorFormData.province,
  postal_code: operatorFormData.postal_code.replace(/\s+/g, ""),
  operator_has_parent_operators: false,
};

const postPartnerParent = {
  legal_name: "Existing Operator 2 Legal Name",
  trade_name: "Existing Operator 2 Trade Name",
  business_structure: "General Partnership",
  cra_business_number: 987654321,
  bc_corporate_registry_number: "def1234567",
  partner_operators_array: [
    {
      partner_legal_name: "Partner Operator Legal Name",
      partner_trade_name: "Partner Operator Trade Name",
      partner_business_structure: "General Partnership",
      partner_cra_business_number: 123456780,
      partner_bc_corporate_registry_number: "zzz1212121",
    },
  ],
  street_address: "123 Main St",
  municipality: "City",
  province: "ON",
  postal_code: "A1B2C3",
  operator_has_parent_operators: true,
  parent_operators_array: [
    {
      po_legal_name: "Parent Operator Legal Name",
      operator_registered_in_canada: true,
      po_cra_business_number: 123456780,
      po_street_address: "789 Oak St",
      po_municipality: "Village",
      po_province: "MB",
      po_postal_code: "M2N3P4",
    },
    {
      po_legal_name: "Foreign Parent Operator Legal Name",
      operator_registered_in_canada: false,
      foreign_address: "788 Cul de Sac",
      foreign_tax_id_number: "fid 123",
    },
  ],
};
const response = { user_operator_id: 1, operator_id: 2, error: null };

// ⛏️ Helper function to fill form mandatory required fields
const fillMandatoryFields = async () => {
  await userEvent.type(
    screen.getByLabelText(/Legal Name+/i),
    postMandatory.legal_name,
  );

  const businessStructureDropdown =
    screen.getByLabelText(/Business Structure+/i);
  await userEvent.click(businessStructureDropdown);
  await userEvent.click(screen.getByText(postMandatory.business_structure));

  await userEvent.type(
    screen.getByLabelText(/CRA Business Number+/i),
    postMandatory.cra_business_number.toString(),
  );

  await userEvent.type(
    screen.getByLabelText(/BC Corporate Registry Number+/i),
    postMandatory.bc_corporate_registry_number,
  );
  await userEvent.type(
    screen.getByLabelText(/Business Mailing Address+/i),
    postMandatory.street_address,
  );
  await userEvent.type(
    screen.getByLabelText(/Municipality+/i),
    postMandatory.municipality,
  );

  const provinceDropdown = screen.getByLabelText(/Province+/i);
  await userEvent.click(provinceDropdown);
  await userEvent.click(screen.getByText(/ontario/i));

  await userEvent.type(
    screen.getByLabelText(/Postal Code+/i),
    postMandatory.postal_code,
  );
};

// ⛏️ Helper function to fill partner and parent form fields
const fillPartnerParentFields = async () => {
  let openDDButtons = screen.getAllByLabelText(/Open/i);

  await userEvent.type(
    screen.getByLabelText(/Trade Name+/i),
    postPartnerParent.trade_name,
  );
  const businessStructureDropdown = openDDButtons[0];
  await userEvent.click(businessStructureDropdown);
  await userEvent.click(screen.getByText(postPartnerParent.business_structure));

  // partner section
  await userEvent.type(
    screen.getAllByLabelText(/Legal Name+/i)[1],
    postPartnerParent.partner_operators_array[0].partner_legal_name,
  );
  await userEvent.type(
    screen.getAllByLabelText(/Trade Name+/i)[1],
    postPartnerParent.partner_operators_array[0].partner_trade_name,
  );

  openDDButtons = screen.getAllByLabelText(/Open/i);

  const openPartnerBusinessStructureButton = openDDButtons[1];
  await userEvent.click(openPartnerBusinessStructureButton);
  await userEvent.click(
    screen.getByText(
      postPartnerParent.partner_operators_array[0].partner_business_structure,
    ),
  );
  await userEvent.type(
    screen.getAllByLabelText(/CRA Business Number+/i)[1],
    postPartnerParent.partner_operators_array[0].partner_cra_business_number.toString(),
  );
  await userEvent.type(
    screen.getAllByLabelText(/BC Corporate Registry Number+/i)[1],
    postPartnerParent.partner_operators_array[0]
      .partner_bc_corporate_registry_number,
  );

  // Set operator_has_parent_operators to true
  await userEvent.click(
    screen.getByLabelText(
      /Does this operator have one or more parent company\?/i,
    ),
  );

  // Set Canadian parent operator
  await userEvent.type(
    screen.getAllByLabelText(/Legal Name+/i)[2],
    postPartnerParent.parent_operators_array?.[0]?.po_legal_name,
  );
  await userEvent.type(
    screen.getAllByLabelText(/CRA Business Number+/i)[2],
    postPartnerParent.parent_operators_array?.[0]?.po_cra_business_number?.toString() ??
      "",
  );
  await userEvent.type(
    screen.getAllByLabelText(/business mailing Address+/i)[1],
    postPartnerParent.parent_operators_array?.[0]?.po_street_address ?? "",
  );
  await userEvent.type(
    screen.getAllByLabelText(/Municipality+/i)[1],
    postPartnerParent.parent_operators_array?.[0]?.po_municipality ?? "",
  );
  openDDButtons = screen.getAllByLabelText(/Open/i);
  const openParentOperatorProvinceDropdown = openDDButtons[3];
  await userEvent.click(openParentOperatorProvinceDropdown);
  await userEvent.click(screen.getByText(/manitoba/i));

  await userEvent.type(
    screen.getAllByLabelText(/Postal Code+/i)[1],
    postPartnerParent.parent_operators_array?.[0]?.po_postal_code ?? "",
  );

  // Add second parent
  const addButton = screen.getAllByText("Add another parent company")[0];
  await userEvent.click(addButton);
  // Get all radio buttons for "Is the parent company registered in Canada?"
  const inCanadaChecks = screen.getAllByLabelText(
    /Is the parent company registered in Canada\?/i,
  );
  expect(inCanadaChecks.length).toBe(2);

  // Set the second radio button (which should correspond to 'false')
  await userEvent.click(inCanadaChecks[1]);

  // Assert that the second radio button (false) is not checked
  expect(inCanadaChecks[1]).not.toBeChecked();

  await userEvent.type(
    screen.getAllByLabelText(/Legal Name+/i)[3],
    postPartnerParent.parent_operators_array?.[1]?.po_legal_name,
  );
  await userEvent.type(
    screen.getAllByLabelText(/mailing address/i)[2],
    postPartnerParent.parent_operators_array?.[1]?.foreign_address ?? "",
  );
  await userEvent.type(
    screen.getAllByLabelText(/Tax ID Number+/i)[0],
    postPartnerParent.parent_operators_array?.[1]?.foreign_tax_id_number ?? "",
  );
};
describe("OperatorForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the empty operator form when creating a new operator", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={{}}
        isCreating={true}
        isInternalUser={false}
      />,
    );
    // form fields and headings
    expectHeader(formHeaders);
    expectField(formFields);
    expectField(["CRA Business Number"], null);
    expect(
      screen.getByLabelText(
        /Does this operator have one or more parent company/i,
      ),
    ).not.toBeChecked();
    expectButton("Submit");
    expectButton("Cancel");
  });
  it("does not allow new operator form submission if there are validation errors", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={{}}
        isCreating={true}
        isInternalUser={false}
      />,
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Wrap the click event in act()
    act(() => {
      submitButton.click();
    });

    // Assert on the validation errors
    expect(screen.getAllByText(/Required field/i)).toHaveLength(8);
  });
  it("fills the mandatory form fields, creates a new operator, updates the session, and shows a success message", async () => {
    // Mock the session and get access to the update function
    const { update } = mockUseSession();

    render(
      <OperatorForm
        schema={testSchema}
        formData={{}}
        isCreating={true}
        isInternalUser={false}
      />,
    );

    await fillMandatoryFields(); // Mock function to fill the form

    // Mock the actionHandler response
    const res = { success: true }; // Example response
    actionHandler.mockReturnValueOnce(res);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    act(() => {
      submitButton.click();
    });

    // Ensure actionHandler is called with the correct arguments
    expect(actionHandler).toHaveBeenNthCalledWith(
      1,
      "registration/v2/user-operators",
      "POST",
      "administration/operators",
      {
        body: JSON.stringify(postMandatory), // Ensure postMandatory is defined
      },
    );

    // Ensure the session is updated by calling the update function
    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({ trigger: "update" });
    });

    // Check for the success message after submission
    await waitFor(() => {
      expect(
        screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
      ).toBeVisible();
    });
  }, 60000);
  it("fills the partner and parent form fields, creates new operator, and redirects on success", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={{}}
        isCreating={true}
        isInternalUser={false}
      />,
    );

    await fillMandatoryFields();
    await fillPartnerParentFields();

    // Submit
    actionHandler.mockReturnValueOnce(response);
    const submitButton = screen.getByRole("button", {
      name: /submit/i,
    });
    act(() => {
      submitButton.click();
    });

    expect(actionHandler).toHaveBeenNthCalledWith(
      1,
      "registration/v2/user-operators",
      "POST",
      "administration/operators",
      {
        body: JSON.stringify(postPartnerParent),
      },
    );
  }, 60000);
  it("edits an Operator", async () => {
    actionHandler.mockReturnValue({ error: null });
    render(
      <OperatorForm
        schema={testSchema}
        formData={operatorFormData}
        isInternalUser={false}
      />,
    );
    const editButton = screen.getByRole("button", { name: /edit/i });
    act(() => {
      editButton.click();
    });

    // 0=operator business stucture, 1=partner biz structure, 2=partner province, 3=operator province
    const openButtons = screen.getAllByLabelText(/Open/i);

    // section 1
    // [0] because the partner/parent operator section asks for some of the same information
    await userEvent.type(screen.getAllByLabelText(/Legal Name+/i)[0], "edit");
    await userEvent.type(screen.getAllByLabelText(/Trade Name+/i)[0], "edit");

    const openBusinessStructureButton = openButtons[0];

    await userEvent.click(openBusinessStructureButton);
    const businessStructureOption = screen.getByText(
      "Limited Liability Partnership",
    );
    await userEvent.click(businessStructureOption);

    await userEvent.clear(screen.getAllByLabelText(/CRA Business Number+/i)[0]);
    await userEvent.type(
      screen.getAllByLabelText(/CRA Business Number+/i)[0],
      "999999999",
    );
    await userEvent.clear(
      screen.getAllByLabelText(/BC Corporate Registry Number+/i)[0],
    );
    await userEvent.type(
      screen.getAllByLabelText(/BC Corporate Registry Number+/i)[0],
      "zzz9999999",
    );

    // Partner operators
    await userEvent.type(screen.getAllByLabelText(/Legal Name+/i)[1], "edit");
    await userEvent.type(screen.getAllByLabelText(/Trade Name+/i)[1], "edit");
    const openPartnerBusinessStructureButton = openButtons[1];

    await userEvent.click(openPartnerBusinessStructureButton);
    await userEvent.click(screen.getByText("Limited Liability Partnership"));
    await userEvent.clear(screen.getAllByLabelText(/CRA Business Number+/i)[1]);
    await userEvent.type(
      screen.getAllByLabelText(/CRA Business Number+/i)[1],
      "888888888",
    );
    await userEvent.clear(
      screen.getAllByLabelText(/BC Corporate Registry Number+/i)[1],
    );
    await userEvent.type(
      screen.getAllByLabelText(/BC Corporate Registry Number+/i)[1],
      "yyy9999999",
    );

    // section 2
    await userEvent.type(screen.getAllByLabelText(/Municipality+/i)[0], "edit");
    await userEvent.type(
      screen.getAllByLabelText(/Business mailing address+/i)[0],
      "edit",
    );
    const openProvinceDropdownButton = openButtons[2];

    await userEvent.click(openProvinceDropdownButton);
    await userEvent.click(screen.getByText(/manitoba/i));
    await userEvent.clear(screen.getAllByLabelText(/Postal Code+/i)[0]);
    await userEvent.type(
      screen.getAllByLabelText(/Postal Code+/i)[0],
      "A1B 2C3",
    );

    //  Canadian parent operator
    await userEvent.type(screen.getAllByLabelText(/Legal Name+/i)[2], "edit");
    await userEvent.clear(screen.getAllByLabelText(/CRA Business Number+/i)[2]);
    await userEvent.type(
      screen.getAllByLabelText(/CRA Business Number+/i)[2],
      "888888888",
    );
    await userEvent.type(
      screen.getAllByLabelText(/business mailing Address+/i)[1],
      "edit",
    );
    await userEvent.type(screen.getAllByLabelText(/Municipality+/i)[1], "edit");
    const openParentOperatorProvinceDropdown = openButtons[3];
    await userEvent.click(openParentOperatorProvinceDropdown);
    await userEvent.click(screen.getByText(/manitoba/i));
    await userEvent.clear(screen.getAllByLabelText(/Postal Code+/i)[1]);
    await userEvent.type(
      screen.getAllByLabelText(/Postal Code+/i)[1],
      "A1B 2C3",
    );

    // Foreign parent operator
    await userEvent.type(screen.getAllByLabelText(/Legal Name+/i)[3], "edit");
    await userEvent.type(
      screen.getAllByLabelText(/mailing address/i)[2],
      "edit",
    );
    await userEvent.type(screen.getByLabelText(/tax id number+/i), "edit");

    // SUBMIT
    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/user-operators/current/operator",
        "PUT",
        "administration/operators",
        {
          body: JSON.stringify({
            legal_name: "Existing Operator 2 Legal Nameedit",
            trade_name: "Existing Operator 2 Trade Nameedit",
            business_structure: "Limited Liability Partnership",
            cra_business_number: 999999999,
            bc_corporate_registry_number: "zzz9999999",
            partner_operators_array: [
              {
                partner_legal_name: "Partner Operator Legal Nameedit",
                partner_trade_name: "Partner Operator Trade Nameedit",
                partner_business_structure: "Limited Liability Partnership",
                partner_cra_business_number: 888888888,
                partner_bc_corporate_registry_number: "yyy9999999",
              },
            ],
            street_address: "123 Main Stedit",
            municipality: "Cityedit",
            province: "MB",
            postal_code: "A1B2C3",
            operator_has_parent_operators: true,
            parent_operators_array: [
              {
                po_legal_name: "Parent Operator Legal Nameedit",
                operator_registered_in_canada: true,
                po_cra_business_number: 888888888,
                po_street_address: "789 Oak Stedit",
                po_municipality: "Villageedit",
                po_province: "MB",
                po_postal_code: "A1B2C3",
              },
              {
                po_legal_name: "Foreign companyedit",
                operator_registered_in_canada: false,
                foreign_address: "f addressedit",
                foreign_tax_id_number: "f id numberedit",
              },
            ],
          }),
        },
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
      ).toBeVisible();
    });
  }, 60000);
  it("loads existing readonly Operator form data for an internal user", async () => {
    const { container } = render(
      <OperatorForm
        schema={testSchema}
        formData={operatorFormData}
        isInternalUser={true}
      />,
    );
    // section 1
    expect(
      container.querySelector("#root_section1_legal_name"),
    ).toHaveTextContent("Existing Operator 2 Legal Name");

    expect(
      container.querySelector("#root_section1_trade_name"),
    ).toHaveTextContent("Existing Operator 2 Trade Name");

    expect(
      container.querySelector("#root_section1_business_structure"),
    ).toHaveTextContent("General Partnership");

    expect(
      container.querySelector("#root_section1_cra_business_number"),
    ).toHaveTextContent("987654321");

    expect(
      container.querySelector("#root_section1_bc_corporate_registry_number"),
    ).toHaveTextContent("def1234567");

    expect(
      container.querySelector(
        "#root_section1_partner_operators_array_0_partner_legal_name",
      ),
    ).toHaveTextContent("Partner Operator Legal Name");

    // section 2
    expect(
      container.querySelector("#root_section2_street_address"),
    ).toHaveTextContent("123 Main St");

    expect(
      container.querySelector("#root_section2_municipality"),
    ).toHaveTextContent("City");

    expect(
      container.querySelector("#root_section2_province"),
    ).toHaveTextContent("Ontario");

    expect(
      container.querySelector("#root_section2_postal_code"),
    ).toHaveTextContent("A1B 2C3");

    // section 3
    expect(
      container.querySelector("#root_section3_operator_has_parent_operators"),
    ).toHaveTextContent("Yes");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_po_legal_name",
      ),
    ).toHaveTextContent("Parent Operator Legal Name");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_po_cra_business_number",
      ),
    ).toHaveTextContent("123456780");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_po_street_address",
      ),
    ).toHaveTextContent("789 Oak St");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_po_municipality",
      ),
    ).toHaveTextContent("Village");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_po_province",
      ),
    ).toHaveTextContent("British Columbia");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_po_postal_code",
      ),
    ).toHaveTextContent("M2N 3P4");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_0_operator_registered_in_canada",
      ),
    ).toHaveTextContent("Yes");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_1_po_legal_name",
      ),
    ).toHaveTextContent("Foreign company");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_1_operator_registered_in_canada",
      ),
    ).toHaveTextContent("No");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_1_foreign_address",
      ),
    ).toHaveTextContent("f address");

    expect(
      container.querySelector(
        "#root_section3_parent_operators_array_1_foreign_tax_id_number",
      ),
    ).toHaveTextContent("f id number");
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });
  it("calls the router.back function if is creating", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={operatorFormData}
        isCreating={true}
        isInternalUser={false}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
  it("calls the router.back function if user is internal", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={operatorFormData}
        isInternalUser={true}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
  it("calls the router.push function if user is not internal and is not creating", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={operatorFormData}
        isCreating={false}
        isInternalUser={false}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
  });
});
