import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  actionHandler,
  useSession,
  useParams,
  useRouter,
} from "@bciers/testConfig/mocks";
import FacilityForm from "apps/administration/app/components/facilities/FacilityForm";
import {
  facilitiesSfoSchema,
  facilitiesSfoUiSchema,
} from "apps/administration/app/data/jsonSchema/facilitiesSfo";
import { RJSFSchema } from "@rjsf/utils";
import {
  facilitiesLfoSchema,
  facilitiesLfoUiSchema,
} from "apps/administration/app/data/jsonSchema/facilitiesLfo";
import { FrontendMessages, FrontEndRoles } from "@bciers/utils/src/enums";
import { expect } from "vitest";
const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";
const facilityId = "025328a0-f9e8-4e1a-888d-aa192cb053db";
const facilityName = "bloop";
const urlOperationFacilities = `/operations/${operationId}/facilities`;
const endPoint = "registration/v2/facilities";
const revalidatePathPost = `/operations/${operationId}/facilities`;

useParams.mockReturnValue({
  operationId: operationId,
});

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const mockReplace = vi.fn();

useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
});

const sfoFormData = {
  name: "Monkeyfuzz",
  type: "Single Facility",
  latitude_of_largest_emissions: "3.000000",
  longitude_of_largest_emissions: "4.000000",
  street_address: "adf",
  municipality: "ad",
  postal_code: "h0h0h0",
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
  is_current_year: true,
  starting_date: "2024-07-11 02:00:00.000 -0700",
};

const lfoFormData = {
  name: "Monkeyfuzz",
  type: "Single Facility",
  well_authorization_numbers: [24546, 54321],
  latitude_of_largest_emissions: "3.000000",
  longitude_of_largest_emissions: "4.000000",
  street_address: "adf",
  municipality: "ad",
  postal_code: "h0h0h0",
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
  is_current_year: true,
  starting_date: "2024-07-11 02:00:00.000 -0700",
};

const defaultFillFormValues = {
  name: "test facility name",
  type_sfo: "Single Facility",
  type_lfo: "Large Facility",
  well_authorization_numbers: [355],
  street_address: "address",
  municipality: "city",
  postal_code: "H0H 0H0",
  latitude_of_largest_emissions: 48.3,
  longitude_of_largest_emissions: 123.32,
  is_current_year: true,
  starting_date: "2024-07-11 02:00:00.000 -0700",
};

const defaultUpdateFormValues = {
  name: "Updated Facility Name",
  well_authorization_numbers: [123],
  street_address: "123 New Address",
  municipality: "New City",
  postal_code: "A1A 1A1",
  latitude_of_largest_emissions: 8.35,
  longitude_of_largest_emissions: -23.3,
  is_current_year: true,
  starting_date: "2024-07-11 02:00:00.000 -0700",
};

const sfoResponsePost = [
  {
    name: "test facility name",
    type: "Single Facility",
    is_current_year: false,
    province: "BC",
    latitude_of_largest_emissions: 48.3,
    longitude_of_largest_emissions: 123.32,
    operation_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
  },
];

const lfoResponsePost = [
  {
    name: "test facility name",
    type: "Large Facility",
    well_authorization_numbers: [355],
    is_current_year: true,
    starting_date: "2024-07-07T09:00:00.000Z",
    street_address: "address",
    municipality: "city",
    province: "BC",
    postal_code: "H0H0H0",
    latitude_of_largest_emissions: 48.3,
    longitude_of_largest_emissions: 123.32,
    operation_id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
  },
];

// ⛏️ Helper function to check mandatory field values
const checkMandatoryFieldValues = async (schema: RJSFSchema) => {
  const isLfoFacility = schema === facilitiesLfoSchema;
  if (isLfoFacility) {
    expect(screen.getByLabelText(/Facility Name+/i)).toHaveValue(
      defaultFillFormValues.name,
    );
    expect(screen.getByLabelText(/Facility Type+/i)).toHaveValue(
      defaultFillFormValues.type_lfo,
    );
  }

  expect(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
  ).toHaveValue(defaultFillFormValues.latitude_of_largest_emissions);
  expect(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
  ).toHaveValue(defaultFillFormValues.longitude_of_largest_emissions);
};
// ⛏️ Helper function to check optional field values
const checkOptionalFieldValues = (
  container: Element | null = null,
  {
    street_address = defaultFillFormValues.street_address,
    municipality = defaultFillFormValues.municipality,
    postal_code = defaultFillFormValues.postal_code,
    latitude_of_largest_emissions = defaultFillFormValues.latitude_of_largest_emissions,
    longitude_of_largest_emissions = defaultFillFormValues.longitude_of_largest_emissions,
  } = {},
) => {
  expect(screen.getByLabelText(/Street address+/i)).toHaveValue(street_address);
  expect(screen.getByLabelText(/Municipality+/i)).toHaveValue(municipality);
  if (container) {
    expect(
      container.querySelector("#root_section2_province"),
    ).toHaveTextContent("British Columbia");
  }
  expect(screen.getByLabelText(/Postal Code+/i)).toHaveValue(postal_code);
  expect(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
  ).toHaveValue(latitude_of_largest_emissions);
  expect(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
  ).toHaveValue(longitude_of_largest_emissions);
};

// ⛏️ Helper function to edit form fields
export const editFormFields = async (schema: RJSFSchema) => {
  const isLfoFacility = schema === facilitiesLfoSchema;
  if (isLfoFacility) {
    // edit the facility name
    const nameInput = screen.getByLabelText(/Facility Name+/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, defaultUpdateFormValues.name);

    const typeInput = screen.getByLabelText(/Facility Type+/i);
    await userEvent.click(typeInput);
    // Select the last option in the dropdown
    const typeOptions = screen.getAllByRole("option");
    const lastTypeOption = typeOptions[typeOptions.length - 1];
    await userEvent.click(lastTypeOption);
  }

  if (isLfoFacility) {
    // edit the well authorization number
    const firstWellAuthInput = screen.getAllByRole("spinbutton")[0];
    await userEvent.clear(firstWellAuthInput); // clear the existing value
    fireEvent.change(firstWellAuthInput, {
      target: { value: defaultUpdateFormValues.well_authorization_numbers },
    }); // enter the new value
  }

  await userEvent.clear(screen.getByLabelText(/Street address+/i));
  await userEvent.type(
    screen.getByLabelText(/Street address+/i),
    defaultUpdateFormValues.street_address,
  );

  await userEvent.clear(screen.getByLabelText(/Municipality+/i));
  await userEvent.type(
    screen.getByLabelText(/Municipality+/i),
    defaultUpdateFormValues.municipality,
  );
  await userEvent.clear(screen.getByLabelText(/Postal Code+/i));
  await userEvent.type(
    screen.getByLabelText(/Postal Code+/i),
    defaultUpdateFormValues.postal_code,
  );

  fireEvent.change(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    {
      target: { value: defaultUpdateFormValues.latitude_of_largest_emissions },
    },
  );
  fireEvent.change(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    {
      target: { value: defaultUpdateFormValues.longitude_of_largest_emissions },
    },
  );
};

// ⛏️ Helper function to fill form mandatory fields
const fillMandatoryFields = async (schema: RJSFSchema) => {
  const isLfoFacility = schema === facilitiesLfoSchema;
  if (isLfoFacility) {
    await userEvent.type(
      screen.getByLabelText(/Facility Name+/i),
      defaultFillFormValues.name,
    );
    // fill type
    const comboBoxInput = screen.getAllByRole("combobox");
    const openFacilityTypeDropdownButton = comboBoxInput[0]?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openFacilityTypeDropdownButton);
    const selectText =
      schema === facilitiesLfoSchema
        ? defaultFillFormValues.type_lfo
        : defaultFillFormValues.type_sfo;
    const typeOption = screen.getByText(selectText);
    await userEvent.click(typeOption);
  }

  fireEvent.change(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    { target: { value: defaultFillFormValues.latitude_of_largest_emissions } },
  );
  fireEvent.change(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    { target: { value: defaultFillFormValues.longitude_of_largest_emissions } },
  );
};

// ⛏️ Helper function to fill optional fields
const fillOptionalFields = async (schema: RJSFSchema) => {
  if (schema === facilitiesLfoSchema) {
    // fill well authorization numbers
    await userEvent.click(screen.getByText("Add Well Authorization Number"));
    const firstWellAuthInput = screen.getAllByRole("spinbutton")[0];
    // have to use fireEvent for number fields
    fireEvent.change(firstWellAuthInput, {
      target: { value: defaultFillFormValues.well_authorization_numbers },
    });
  }
  // fill year and starting date
  const year = screen.getByLabelText(/Did this facility begin operations+/i);
  await userEvent.click(year);
  await userEvent.type(
    screen.getByLabelText(/Date of facility starting operations+/i),
    defaultFillFormValues.starting_date,
  );

  await userEvent.type(
    screen.getByLabelText(/Street address+/i),
    defaultFillFormValues.street_address,
  );
  await userEvent.type(
    screen.getByLabelText(/Municipality+/i),
    defaultFillFormValues.municipality,
  );

  await userEvent.type(
    screen.getByLabelText(/Postal Code+/i),
    defaultFillFormValues.postal_code,
  );
};

// ⛏️ Helper function to simulate form POST submission and assert the result
const assertFormPost = async (
  responseData: Record<string, any>,
): Promise<void> => {
  // Set up the mock before the click event
  const response = [
    {
      id: facilityId,
      name: facilityName,
      error: null,
    },
  ];
  actionHandler.mockReturnValueOnce(response);

  // Find and click the submit button
  const submitButton = screen.getByRole("button", { name: /submit/i });
  act(() => {
    userEvent.click(submitButton);
  });

  // Add some delay to allow async processes to complete
  await new Promise((r) => setTimeout(r, 100));

  // Assertion to check if actionHandler was called correctly
  expect(actionHandler).toHaveBeenCalledWith(
    endPoint,
    "POST",
    revalidatePathPost,
    {
      body: JSON.stringify(responseData),
    },
  );

  await waitFor(() => {
    expect(
      screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
    ).toBeVisible();
  });
};

// ⛏️ Helper function to simulate form PUT submission and assert the result
const assertFormPut = async (): Promise<void> => {
  // Submit valid form data
  const submitButton = screen.getByRole("button", { name: /submit/i });
  act(() => {
    userEvent.click(submitButton);
  });
  actionHandler.mockReturnValue({ error: null });
  await waitFor(() => {
    expect(
      screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
    ).toBeVisible();
  });
};

describe("FacilityForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the empty SFO facility form when creating a new facility", async () => {
    const { container } = render(
      <FacilityForm
        schema={facilitiesSfoSchema}
        uiSchema={facilitiesSfoUiSchema}
        formData={{}}
        isCreating
      />,
    );
    // form fields and headings
    expect(
      screen.getByRole("heading", { name: /Facility Information/i }),
    ).toBeVisible();
    // Can't get read only fields by label
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "",
    );
    expect(
      screen.getByLabelText(/Did this facility begin operations in+/i),
    ).not.toBeChecked();
    expect(
      screen.queryByLabelText(/Date of facility starting operations+/i),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: /Facility Address/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Street address+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Municipality+/i)).toHaveValue("");
    expect(
      container.querySelector("#root_section2_province"),
    ).toHaveTextContent("British Columbia");
    expect(screen.getByLabelText(/Postal Code+/i)).toHaveValue("");
    expect(
      screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    ).toHaveValue(null);
    expect(
      screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    ).toHaveValue(null);
    // submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeEnabled();
  });
  it("renders the empty LFO facility form when creating a new facility", async () => {
    const { container } = render(
      <FacilityForm
        schema={facilitiesLfoSchema}
        uiSchema={facilitiesLfoUiSchema}
        formData={{}}
        isCreating
      />,
    );
    // form fields and headings
    expect(
      screen.getByRole("heading", { name: /Facility Information/i }),
    ).toBeVisible();
    // Can't get read only fields by label
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "",
    );

    expect(
      screen.getByText(/BC Energy Regulator Well Authorization+/i),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add Well Authorization Number" }),
    ).toBeVisible();
    expect(
      screen.getByLabelText(/Did this facility begin operations in+/i),
    ).not.toBeChecked();
    expect(
      screen.queryByLabelText(/Date of facility starting operations+/i),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: /Facility Address/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Street address+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Municipality+/i)).toHaveValue("");
    expect(
      container.querySelector("#root_section2_province"),
    ).toHaveTextContent("British Columbia");
    expect(screen.getByLabelText(/Postal Code+/i)).toHaveValue("");
    expect(
      screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    ).toHaveValue(null);
    expect(
      screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    ).toHaveValue(null);
    // submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeEnabled();
  });
  it("loads existing readonly SFO form data", async () => {
    const { container } = render(
      <FacilityForm
        schema={facilitiesSfoSchema}
        uiSchema={facilitiesSfoUiSchema}
        formData={sfoFormData}
      />,
    );
    // form fields
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "Monkeyfuzz",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "Single Facility",
    );
    expect(
      container.querySelector("#root_section1_is_current_year"),
    ).toHaveTextContent("Yes");
    await waitFor(() =>
      expect(
        container.querySelector("#root_section1_starting_date"),
      ).toBeInTheDocument(),
    );
    expect(
      container.querySelector("#root_section1_starting_date"),
    ).toHaveTextContent("2024-07-11");
    expect(
      container.querySelector("#root_section2_street_address"),
    ).toHaveTextContent("adf");
    expect(
      container.querySelector("#root_section2_municipality"),
    ).toHaveTextContent("ad");
    expect(
      container.querySelector("#root_section2_province"),
    ).toHaveTextContent("British Columbia");
    expect(
      container.querySelector("#root_section2_postal_code"),
    ).toHaveTextContent("h0h0h0");
    expect(
      container.querySelector("#root_section2_latitude_of_largest_emissions"),
    ).toHaveTextContent("3.000000");
    expect(
      container.querySelector("#root_section2_longitude_of_largest_emissions"),
    ).toHaveTextContent(".000000");
  });
  it("loads existing readonly LFO form data", async () => {
    const { container } = render(
      <FacilityForm
        schema={facilitiesLfoSchema}
        uiSchema={facilitiesLfoUiSchema}
        formData={lfoFormData}
      />,
    );
    // form fields
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "Monkeyfuzz",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "Single Facility",
    );
    expect(
      screen.getByText("BC Energy Regulator Well Authorization Number(s)"),
    ).toBeVisible();
    expect(screen.getByText(24546)).toBeVisible();
    expect(screen.getByText(54321)).toBeVisible();
    expect(
      container.querySelector("#root_section1_is_current_year"),
    ).toHaveTextContent("Yes");
    await waitFor(() =>
      expect(
        container.querySelector("#root_section1_starting_date"),
      ).toBeInTheDocument(),
    );
    expect(
      container.querySelector("#root_section1_starting_date"),
    ).toHaveTextContent("2024-07-11");
    expect(
      container.querySelector("#root_section2_street_address"),
    ).toHaveTextContent("adf");
    expect(
      container.querySelector("#root_section2_municipality"),
    ).toHaveTextContent("ad");
    expect(
      container.querySelector("#root_section2_province"),
    ).toHaveTextContent("British Columbia");
    expect(
      container.querySelector("#root_section2_postal_code"),
    ).toHaveTextContent("h0h0h0");
    expect(
      container.querySelector("#root_section2_latitude_of_largest_emissions"),
    ).toHaveTextContent("3.000000");
    expect(
      container.querySelector("#root_section2_longitude_of_largest_emissions"),
    ).toHaveTextContent(".000000");
  });
  it("does not allow SFO submission if there are validation errors (empty form data)", async () => {
    render(
      <FacilityForm
        schema={facilitiesSfoSchema}
        uiSchema={facilitiesSfoUiSchema}
        formData={{}}
        isCreating
      />,
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    act(() => {
      submitButton.click();
    });
    expect(screen.getAllByText(/Required field/i)).toHaveLength(4);

    //check starting date required when year is clicked
    const year = screen.getByLabelText(
      /Did this facility begin operations in+/i,
    );
    act(() => {
      year.click();
      submitButton.click();
    });
    expect(screen.getAllByText(/Required field/i)).toHaveLength(5);
  });
  it("does not allow LFO submission if there are validation errors (bad form data)", async () => {
    render(
      <FacilityForm
        schema={facilitiesLfoSchema}
        uiSchema={facilitiesLfoUiSchema}
        formData={{
          latitude_of_largest_emissions: -600,
          longitude_of_largest_emissions: 1800,
          postal_code: "garbage",
        }}
      />,
    );

    const editButton = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editButton);
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);
    expect(screen.getAllByText(/Required field/i)).toHaveLength(2); // name and type
    expect(screen.getAllByText(/Format should be A1A 1A1/i)).toHaveLength(1);
    expect(screen.getAllByText(/must be >= -90/i)).toHaveLength(1);
    expect(screen.getAllByText(/must be <= 180/i)).toHaveLength(1);
  });
  // created this starting datetest to get around form without edit fields in the last test
  it("does not allow LFO submission if there is a starting date validation error", async () => {
    render(
      <FacilityForm
        schema={facilitiesLfoSchema}
        uiSchema={facilitiesLfoUiSchema}
        formData={{}}
        isCreating
      />,
    );

    // fill name
    await userEvent.type(screen.getByLabelText(/Facility Name+/i), "test");

    // fill type
    const comboBoxInput = screen.getAllByRole(
      "combobox",
    )[0] as HTMLInputElement;
    const openComboboxButton = comboBoxInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;
    await userEvent.click(openComboboxButton);
    const typeOption = screen.getByText("Large Facility");
    await userEvent.click(typeOption);

    // fill year and starting date with wrong info
    const year = screen.getByLabelText(/Did this facility begin operations+/i);
    await userEvent.click(year);
    await userEvent.type(
      screen.getByLabelText(/Date of facility starting operations+/i),
      "20200101",
    );

    // fill lat and long
    fireEvent.change(
      screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
      { target: { value: 3 } },
    );
    fireEvent.change(
      screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
      { target: { value: 6 } },
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    // expect to see validation error for starting date
    expect(screen.getAllByText(/Starting Date must be between/i)).toHaveLength(
      1,
    );

    // refill year and starting date to check for proper format
    await userEvent.clear(
      screen.getByLabelText(/Date of facility starting operations+/i),
    );
    await userEvent.type(
      screen.getByLabelText(/Date of facility starting operations+/i),
      "202",
    );
    fireEvent.click(submitButton);

    // expect to see format error for starting date
    expect(
      screen.getAllByText(/Starting Date format should be YYYY-MM-DD/i),
    ).toHaveLength(1);
  });

  it(
    "fills the mandatory form fields, creates new SFO facility, and redirects on success",
    {
      timeout: 20000,
    },
    async () => {
      render(
        <FacilityForm
          isCreating
          schema={facilitiesSfoSchema}
          uiSchema={facilitiesSfoUiSchema}
          formData={{
            name: "test facility name",
            type: "Single Facility",
          }}
        />,
      );

      //fill fields
      await fillMandatoryFields(facilitiesSfoSchema);
      await checkMandatoryFieldValues(facilitiesSfoSchema);

      // submit valid form data, assert response
      await assertFormPost(sfoResponsePost);
    },
  );
  it(
    "fills all form fields, creates new LFO facility, and redirects on success",
    {
      timeout: 20000,
    },
    async () => {
      render(
        <FacilityForm
          isCreating
          schema={facilitiesLfoSchema}
          uiSchema={facilitiesLfoUiSchema}
          formData={{}}
        />,
      );

      //fill fields
      await fillMandatoryFields(facilitiesLfoSchema);
      await checkMandatoryFieldValues(facilitiesLfoSchema);
      await fillOptionalFields(facilitiesLfoSchema);
      await checkOptionalFieldValues();

      // submit valid form data, assert response
      await assertFormPost(lfoResponsePost);
    },
  );

  it(
    "creates a new facility, edits it, and submits the updated facility",
    {
      timeout: 20000,
    },
    async () => {
      render(
        <FacilityForm
          isCreating
          schema={facilitiesSfoSchema}
          uiSchema={facilitiesSfoUiSchema}
          formData={{
            name: "test facility name",
            type: "Single Facility",
          }}
        />,
      );

      //fill fields
      await fillMandatoryFields(facilitiesSfoSchema);
      await checkMandatoryFieldValues(facilitiesSfoSchema);

      // assert first invocation: POST
      await assertFormPost(sfoResponsePost);

      // edit the form
      const editButton = screen.getByRole("button", { name: /edit/i });
      act(() => {
        editButton.click();
      });
      await editFormFields(facilitiesSfoSchema);

      // assert first invocation: PUT
      await assertFormPut();
    },
  );
  it(
    "it edits a SFO Facility form, submits form, and displays success",
    {
      timeout: 20000,
    },
    async () => {
      render(
        <FacilityForm
          schema={facilitiesSfoSchema}
          uiSchema={facilitiesSfoUiSchema}
          formData={sfoFormData}
        />,
      );

      // Buttons
      expect(screen.getByRole("button", { name: /edit/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();

      const editButton = screen.getByRole("button", { name: /edit/i });
      act(() => {
        editButton.click();
      });

      // Buttons
      expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();

      // Edit form fields
      await editFormFields(facilitiesSfoSchema);

      // submit valid form data, assert response
      await assertFormPut();
    },
  );
  it(
    "it edits a LFO Facility form, submits form, and displays success",
    {
      timeout: 20000,
    },
    async () => {
      render(
        <FacilityForm
          schema={facilitiesLfoSchema}
          uiSchema={facilitiesLfoUiSchema}
          formData={lfoFormData}
        />,
      );

      // Buttons
      expect(screen.getByRole("button", { name: /edit/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();

      const editButton = screen.getByRole("button", { name: /edit/i });
      act(() => {
        editButton.click();
      });

      // Buttons
      expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
      // Edit form fields
      await editFormFields(facilitiesLfoSchema);

      // submit valid form data, assert response
      await assertFormPut();
    },
  );
  it("redirects to the operation's facilities grid on cancel", async () => {
    render(
      <FacilityForm
        schema={facilitiesSfoSchema}
        uiSchema={facilitiesSfoUiSchema}
        formData={{}}
        isCreating
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    // Simulate the user clicking the cancel button
    fireEvent.click(cancelButton);

    // Assert that router.push was called with the correct URL
    expect(mockReplace).toHaveBeenCalledWith(urlOperationFacilities);
  });

  it("should use formContext to correctly render BCGHG ID widgets for cas directors", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: FrontEndRoles.CAS_DIRECTOR,
        },
      },
    });

    render(
      <FacilityForm
        formData={sfoFormData}
        schema={{
          type: "object",
          properties: {
            section1: {
              title: "Section 1",
              type: "object",
              properties: {
                bcghg_id: {
                  type: "string",
                  title: "BCGHGID",
                },
              },
            },
          },
        }}
        uiSchema={facilitiesSfoUiSchema}
      />,
    );

    expect(
      screen.getByRole("button", { name: `＋ Issue BCGHG ID` }),
    ).toBeVisible();
  });
  it("should not show buttons for non-director users", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    });

    render(
      <FacilityForm
        formData={sfoFormData}
        schema={{
          type: "object",
          properties: {
            section1: {
              title: "Section 1",
              type: "object",
              properties: {
                bcghg_id: {
                  type: "string",
                  title: "BCGHGID",
                },
              },
            },
          },
        }}
        uiSchema={facilitiesSfoUiSchema}
      />,
    );

    expect(
      screen.queryByRole("button", { name: `＋ Issue BCGHG ID` }),
    ).not.toBeInTheDocument();
  });
  it("should not render the edit button for internal users", () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    });

    render(
      <FacilityForm
        schema={facilitiesSfoSchema}
        uiSchema={facilitiesSfoUiSchema}
        formData={sfoFormData}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });
});
