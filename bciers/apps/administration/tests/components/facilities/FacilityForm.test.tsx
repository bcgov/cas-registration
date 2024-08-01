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
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "../../../app/data/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "../../../app/data/jsonSchema/facilitiesLfo";
import { RJSFSchema } from "@rjsf/utils";

const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";
const facilityId = "025328a0-f9e8-4e1a-888d-aa192cb053db";
const facilityName = "bloop";
const urlOperations = `/operations/${operationId}/facilities`;
const endPoint = `/operations/${operationId}/facilities/${facilityId}&facilitiesTitle=${facilityName}`;
const revalidatePath = `/operations/${operationId}/facilities/${facilityId}`;

const sfoFormData = {
  name: "Monkeyfuzz",
  type: "Single Facility Operation",
  latitude_of_largest_emissions: "3.000000",
  longitude_of_largest_emissions: "4.000000",
  street_address: "adf",
  municipality: "ad",
  province: "BC",
  postal_code: "h0h0h0",
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
};
const lfoFormData = {
  name: "Monkeyfuzz",
  type: "Single Facility Operation",
  well_authorization_numbers: [24546, 54321],
  latitude_of_largest_emissions: "3.000000",
  longitude_of_largest_emissions: "4.000000",
  street_address: "adf",
  municipality: "ad",
  province: "BC",
  postal_code: "h0h0h0",
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
};
const defaultFillFormValues = {
  name: "test",
  well_authorization_numbers: [355],
  street_address: "address",
  municipality: "city",
  province: "Alberta",
  postal_code: "H0H 0H0",
  latitude_of_largest_emissions: 48.3,
  longitude_of_largest_emissions: 123.32,
};
const defaultUpdateFormValues = {
  name: "Updated Facility Name",
  well_authorization_numbers: [123],
  street_address: "123 New Address",
  municipality: "New City",
  province: "Alberta",
  postal_code: "A1A 1A1",
  latitude_of_largest_emissions: 8.35,
  longitude_of_largest_emissions: -23.3,
};

// ⛏️ Helper function to check field values
const checkFormValues = ({
  street_address = defaultFillFormValues.street_address,
  municipality = defaultFillFormValues.municipality,
  province = defaultFillFormValues.province,
  postal_code = defaultFillFormValues.postal_code,
  latitude_of_largest_emissions = defaultFillFormValues.latitude_of_largest_emissions,
  longitude_of_largest_emissions = defaultFillFormValues.longitude_of_largest_emissions,
} = {}) => {
  expect(screen.getByLabelText(/Street address+/i)).toHaveValue(street_address);
  expect(screen.getByLabelText(/Municipality+/i)).toHaveValue(municipality);
  expect(screen.getByLabelText(/Province+/i)).toHaveValue(province);
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
  const nameInput = screen.getByLabelText(/Facility Name+/i);
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, defaultUpdateFormValues.name);

  const typeInput = screen.getByLabelText(/Facility Type+/i);
  await userEvent.click(typeInput);
  // Select the last option in the dropdown
  const typeOptions = screen.getAllByRole("option");
  const lastTypeOption = typeOptions[typeOptions.length - 1];
  await userEvent.click(lastTypeOption);

  if (schema === facilitiesSchemaLfo) {
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
  const provinceDropdown = screen.getByLabelText(/Province+/i);
  await userEvent.click(provinceDropdown);
  await userEvent.click(
    screen.getByText(new RegExp(defaultUpdateFormValues.province, "i")),
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

<<<<<<< HEAD
// ⛏️ Helper function to fill form mandatory fields
const fillMandatoryFields = async (schema: RJSFSchema) => {
  await userEvent.type(
    screen.getByLabelText(/Facility Name+/i),
    defaultFillFormValues.name,
  );
  const typeInput = screen.getByLabelText(/Facility Type+/i);
  await userEvent.click(typeInput);
  // Select the first option in the dropdown
  const typeOption = screen.getAllByRole("option")[0];
  await userEvent.click(typeOption);

  if (schema === facilitiesSchemaLfo) {
    // fill well authorization numbers
    await userEvent.click(screen.getByText("Add"));
    const firstWellAuthInput = screen.getAllByRole("spinbutton")[0];
    // have to use fireEvent for number fields
    fireEvent.change(firstWellAuthInput, {
      target: { value: defaultFillFormValues.well_authorization_numbers },
    });
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
const fillOptionalFields = async () => {
  await userEvent.type(
    screen.getByLabelText(/Street address+/i),
    defaultFillFormValues.street_address,
  );
  await userEvent.type(
    screen.getByLabelText(/Municipality+/i),
    defaultFillFormValues.municipality,
  );

  const provinceDropdown = screen.getByLabelText(/Province+/i);
  await userEvent.click(provinceDropdown);
  await userEvent.click(
    screen.getByText(new RegExp(defaultFillFormValues.province, "i")),
  );

  await userEvent.type(
    screen.getByLabelText(/Postal Code+/i),
    defaultFillFormValues.postal_code,
  );
};

useParams.mockReturnValue({
  operationId: operationId,
});
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

=======
// ⛏️ Helper function to check field values
const checkFormValues = ({
  streetAddress = "address",
  municipality = "city",
  province = "Alberta",
  postalCode = "H0H 0H0",
  latitude = 48.3,
  longitude = 123.32,
} = {}) => {
  expect(screen.getByLabelText(/Street address+/i)).toHaveValue(streetAddress);
  expect(screen.getByLabelText(/Municipality+/i)).toHaveValue(municipality);
  expect(screen.getByLabelText(/Province+/i)).toHaveValue(province);
  expect(screen.getByLabelText(/Postal Code+/i)).toHaveValue(postalCode);
  expect(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
  ).toHaveValue(latitude);
  expect(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
  ).toHaveValue(longitude);
};

>>>>>>> 886a9363 (test: add vitest fn to check field values)
describe("FacilityForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("redirects to the facilities grid on cancel", async () => {
    render(
      <FacilityForm
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
        isCreating
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    // Simulate the user clicking the cancel button
    fireEvent.click(cancelButton);

    // Assert that router.push was called with the correct URL
    expect(mockPush).toHaveBeenCalledWith(urlOperations);
  });
  it("renders the empty SFO facility form when creating a new facility", async () => {
    render(
      <FacilityForm
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
        isCreating
      />,
    );
    // form fields and headings
    expect(
      screen.getByRole("heading", { name: /Facility Information/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Facility Name+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Facility Type+/i)).toHaveValue("");
    expect(
      screen.getByRole("heading", { name: /Facility Address/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Street address+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Municipality+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Province+/i)).toHaveValue("");
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
    render(
      <FacilityForm
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
        isCreating
      />,
    );
    // form fields and headings
    expect(
      screen.getByRole("heading", { name: /Facility Information/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Facility Name+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Facility Type+/i)).toHaveValue("");

    expect(screen.getByText(/Authorization+/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Add" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /Facility Address/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Street address+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Municipality+/i)).toHaveValue("");
    expect(screen.getByLabelText(/Province+/i)).toHaveValue("");
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
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={sfoFormData}
      />,
    );
    // form fields
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "Monkeyfuzz",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "Single Facility Operation",
    );
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
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={lfoFormData}
      />,
    );
    // form fields
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "Monkeyfuzz",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "Single Facility Operation",
    );
    expect(screen.getByText("Well Authorization Number(s)")).toBeVisible();
    expect(screen.getByText(24546)).toBeVisible();
    expect(screen.getByText(54321)).toBeVisible();
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
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
        isCreating
      />,
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    act(() => {
      submitButton.click();
    });
    expect(screen.getAllByText(/Required field/i)).toHaveLength(4);
  });
  it("does not allow LFO submission if there are validation errors (bad form data)", async () => {
    render(
      <FacilityForm
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
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
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
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
    console.log("test");

    // expect to see format error for starting date
    expect(
      screen.getAllByText(/Starting Date format should be YYYY-MM-DD/i),
    ).toHaveLength(1);
  });

  it("fills the mandatory form fields, creates new SFO facility, and redirects on success", async () => {
    render(
      <FacilityForm
        isCreating
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
      />,
    );

    //fill fields
    await fillMandatoryFields(facilitiesSchemaSfo);
    // submit valid form data
    const submitButton = screen.getByRole("button", { name: /submit/i });
    actionHandler.mockReturnValueOnce({
      id: facilityId,
      name: facilityName,
      error: null,
    });

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(endPoint, {
        shallow: true,
      });
    });
  });
  it("fills the mandatory form fields, creates new LFO facility, and redirects on success", async () => {
    render(
      <FacilityForm
        isCreating
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
      />,
    );

    //fill fields
    await fillMandatoryFields(facilitiesSchemaLfo);

    // submit valid form data
    const submitButton = screen.getByRole("button", { name: /submit/i });
    actionHandler.mockReturnValueOnce({
      id: facilityId,
      name: facilityName,
      error: null,
    });

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(endPoint, {
        shallow: true,
      });
    });
  });
  it("fills all form fields, creates new SFO facility, and redirects on success", async () => {
    render(
      <FacilityForm
        isCreating
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
      />,
    );

    //fill fields
    await fillMandatoryFields(facilitiesSchemaSfo);
    await fillOptionalFields();

    // CHECK FIELDS ARE FILLED
    checkFormValues();

    // SUBMIT
    const submitButton = screen.getByRole("button", { name: /submit/i });
    actionHandler.mockReturnValueOnce({
      id: facilityId,
      name: facilityName,
      error: null,
    });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(endPoint, {
        shallow: true,
      });
    });
  });
  it("fills all form fields, creates new LFO facility, and redirects on success", async () => {
    render(
      <FacilityForm
        isCreating
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
      />,
    );

    //fill fields
    await fillMandatoryFields(facilitiesSchemaLfo);
    await fillOptionalFields();

    // CHECK FIELDS ARE FILLED
    checkFormValues();

    // SUBMIT
    const submitButton = screen.getByRole("button", { name: /submit/i });
    actionHandler.mockReturnValueOnce({
      id: facilityId,
      name: facilityName,
      error: null,
    });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(endPoint, {
        shallow: true,
      });
    });
  });
  it("it edits a SFO Facility form", async () => {
    render(
      <FacilityForm
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={sfoFormData}
      />,
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    act(() => {
      editButton.click();
    });

    // Edit form fields
    await editFormFields(facilitiesSchemaSfo);

    // Submit valid form data
    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);
    actionHandler.mockReturnValue({ error: null });
    await waitFor(() => {
      expect(
        screen.getByText("Your edits were saved successfully"),
      ).toBeVisible();
    });
  });
  it("it edits a LFO Facility form", async () => {
    render(
      <FacilityForm
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={lfoFormData}
      />,
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    act(() => {
      editButton.click();
    });

    // Edit form fields
    await editFormFields(facilitiesSchemaLfo);

    // Submit valid form data
    actionHandler.mockReturnValue({ error: null });
    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Your edits were saved successfully"),
      ).toBeVisible();
    });
  });
});
