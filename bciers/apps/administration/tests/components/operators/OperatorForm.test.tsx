import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actionHandler, useSession, useRouter } from "@bciers/testConfig/mocks";

import { operatorSchema } from "../../../../administration/app/data/jsonSchema/operator";
import OperatorForm from "../../../../administration/app/components/operators/OperatorForm";
import { createOperatorSchema } from "../../../../administration/app/components/operators/Operator";

useSession.mockReturnValue({
  get: vi.fn(),
});

const mockReplace = vi.fn();
const mockPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
  push: mockPush,
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

describe("OperatorForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("redirects on cancel", async () => {
    render(<OperatorForm schema={testSchema} formData={operatorFormData} />);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    act(() => {
      cancelButton.click();
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });
  it("loads existing readonly Operator form data", async () => {
    const { container } = render(
      <OperatorForm schema={testSchema} formData={operatorFormData} />,
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
  });

  it("edits an Operator", async () => {
    actionHandler.mockReturnValue({ error: null });
    render(<OperatorForm schema={testSchema} formData={operatorFormData} />);
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
  }, 60000);

  it("shows the correct fields and errors when adding partner operator", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={{
          street_address: "123 Main St",
          municipality: "City",
          province: "ON",
          postal_code: "A1B 2C3",
          operator_has_parent_operators: false,
          id: "4242ea9d-b917-4129-93c2-db00b7451051",
          legal_name: "Existing Operator 2 Legal Name",
          trade_name: "Existing Operator 2 Trade Name",
          business_structure: "General Partnership",
          cra_business_number: 987654321,
          bc_corporate_registry_number: "def1234567",
          mailing_address: 5,
        }}
      />,
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    act(() => {
      editButton.click();
    });

    // 0=operator business stucture, 1=partner biz structure, 2=partner province, 3=operator province
    const openButtons = screen.getAllByLabelText(/Open/i);
    const openBusinessStructureButton = openButtons[0];

    await userEvent.click(openBusinessStructureButton);
    const businessStructureOption = screen.getByText(
      "Limited Liability Partnership",
    );
    await userEvent.click(businessStructureOption);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/required field/i)).toHaveLength(4); // "partner_legal_name","partner_business_structure","partner_cra_business_number","partner_bc_corporate_registry_number", (no error on the partner dropdown or non-required fields)
    });
  });

  it("shows the correct fields and errors when adding parent operator", async () => {
    render(
      <OperatorForm
        schema={testSchema}
        formData={{
          street_address: "123 Main St",
          municipality: "City",
          province: "ON",
          postal_code: "A1B 2C3",
          operator_has_parent_operators: false,
          id: "4242ea9d-b917-4129-93c2-db00b7451051",
          legal_name: "Existing Operator 2 Legal Name",
          trade_name: "Existing Operator 2 Trade Name",
          business_structure: "BC Corporation",
          cra_business_number: 987654321,
          bc_corporate_registry_number: "def1234567",
          mailing_address: 5,
        }}
      />,
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    act(() => {
      editButton.click();
    });

    const parentToggle = screen.getByText(
      /Does this operator have one or more parent company?/i,
    );
    userEvent.click(parentToggle);
    await waitFor(() => {
      expect(
        screen.getByText(/Is the parent company registered in Canada?/i),
      ).toBeVisible();
    });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/required field/i)).toHaveLength(6); // "po_legal_name", "po_cra_business_number","po_street_address","po_municipality","po_province","po_postal_code",, (no error on the partner dropdown or non-required fields)
    });
  });
});
