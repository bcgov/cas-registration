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
interface FacilityPayload {
  name: string;
  type: string;
  well_authorization_numbers?: number[];
  street_address: string;
  municipality: string;
  province: string;
  postal_code: string;
  latitude_of_largest_emissions: number;
  longitude_of_largest_emissions: number;
  operation_id: string;
}

const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";
const facilityId = "025328a0-f9e8-4e1a-888d-aa192cb053db";
const facilityName = "bloop";

// edit form data payload
let editPayload: FacilityPayload = {
  name: "Updated Facility Name",
  type: "Single Facility",
  street_address: "123 New Address",
  municipality: "New City",
  province: "AB",
  postal_code: "A1B2C3",
  latitude_of_largest_emissions: 48.4,
  longitude_of_largest_emissions: -123.32,
  operation_id: operationId,
};

function getFacilityTypeOption(schema: RJSFSchema) {
  return schema === facilitiesSchemaSfo
    ? "Single Facility Operation"
    : "Large Facility";
}
// ⛏️ helper to fill form fields
const fillFormFields = async (schema: RJSFSchema) => {
  await userEvent.type(screen.getByLabelText(/Facility Name+/i), "test");

  const comboBoxInput = screen.getAllByRole("combobox")[0] as HTMLInputElement;
  const openComboboxButton = comboBoxInput?.parentElement?.children[1]
    ?.children[0] as HTMLInputElement;
  await userEvent.click(openComboboxButton);

  const typeOption = getFacilityTypeOption(schema);
  await userEvent.click(screen.getByText(typeOption));

  fireEvent.change(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    { target: { value: 3 } },
  );
  fireEvent.change(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    { target: { value: 6 } },
  );

  await userEvent.type(screen.getByLabelText(/Street address+/i), "address");
  await userEvent.type(screen.getByLabelText(/Municipality+/i), "city");

  const comboBoxInputAll = screen.getAllByRole("combobox");
  const openProvinceDropdownButton = comboBoxInputAll[1]?.parentElement
    ?.children[1]?.children[0] as HTMLInputElement;
  await userEvent.click(openProvinceDropdownButton);
  await userEvent.click(screen.getByText(/alberta/i));

  await userEvent.type(screen.getByLabelText(/Postal Code+/i), "H0H 0H0");

  if (schema === facilitiesSchemaLfo) {
    // fill well authorization numbers
    await userEvent.click(screen.getByText("Add"));
    const firstWellAuthInput = screen.getAllByRole("spinbutton")[0];
    // have to use fireEvent for number fields
    fireEvent.change(firstWellAuthInput, { target: { value: 355 } });
  }
};
// ⛏️ helper to edit form fields
export const editFormFields = async (schema: RJSFSchema) => {
  const nameInput = screen.getByLabelText(/Facility Name+/i);
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, "Updated Facility Name");

  const typeInput = screen.getByLabelText(/Facility Type+/i);
  await userEvent.click(typeInput);
  const typeOption = getFacilityTypeOption(schema);
  await userEvent.click(screen.getByText(typeOption));

  if (schema === facilitiesSchemaLfo) {
    if (typeOption === "Large Facility") {
      // Reassign editPayload to ensure well_authorization_numbers is at index 2
      editPayload = {
        name: editPayload.name,
        type: typeOption,
        well_authorization_numbers: [24546, 54321],
        street_address: editPayload.street_address,
        municipality: editPayload.municipality,
        province: editPayload.province,
        postal_code: editPayload.postal_code,
        latitude_of_largest_emissions:
          editPayload.latitude_of_largest_emissions,
        longitude_of_largest_emissions:
          editPayload.longitude_of_largest_emissions,
        operation_id: editPayload.operation_id,
      };
    }
  }

  await userEvent.clear(screen.getByLabelText(/Street address+/i));
  await userEvent.type(
    screen.getByLabelText(/Street address+/i),
    "123 New Address",
  );

  await userEvent.clear(screen.getByLabelText(/Municipality+/i));
  await userEvent.type(screen.getByLabelText(/Municipality+/i), "New City");

  const provinceDropdown = screen.getByLabelText(/Province+/i);
  await userEvent.click(provinceDropdown);
  const provinceOption = screen.getByText(/alberta/i);
  await userEvent.click(provinceOption);

  await userEvent.clear(screen.getByLabelText(/Postal Code+/i));
  await userEvent.type(screen.getByLabelText(/Postal Code+/i), "A1B 2C3");

  fireEvent.change(
    screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    {
      target: { value: 48.4 },
    },
  );
  fireEvent.change(
    screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    {
      target: { value: -123.32 },
    },
  );
};

useParams.mockReturnValue({
  operationId: operationId,
});

useSession.mockReturnValue({
  get: vi.fn(),
});

const mockReplace = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
});

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

describe("FacilityForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
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
  it("fills the mandatory form fields, creates new SFO facility, and redirects on success", async () => {
    render(
      <FacilityForm
        isCreating
        schema={facilitiesSchemaSfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    actionHandler.mockReturnValueOnce({
      id: facilityId,
      name: facilityName,
      error: null,
    });

    //fill fields
    await fillFormFields(facilitiesSchemaSfo);
    // submit valid form data
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        `/operations/${operationId}/facilities/${facilityId}&facilitiesTitle=${facilityName}`,
        {
          shallow: true,
        },
      );
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

    const submitButton = screen.getByRole("button", { name: /submit/i });
    actionHandler.mockReturnValueOnce({
      id: facilityId,
      name: facilityName,
      error: null,
    });

    //fill fields
    await fillFormFields(facilitiesSchemaLfo);

    // submit valid form data
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        `/operations/${operationId}/facilities/${facilityId}&facilitiesTitle=${facilityName}`,
        {
          shallow: true,
        },
      );
    });
  });
  it("it edits a SFO Facility form", async () => {
    actionHandler.mockReturnValue({ error: null });
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

    // edit for fields
    await editFormFields(facilitiesSchemaSfo);
    // submit valid form data
    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Your edits were saved successfully"),
      ).toBeVisible();
      expect(actionHandler).toHaveBeenCalledWith(
        `registration/facilities/${sfoFormData.id}`,
        "PUT",
        `/operations/${operationId}/facilities/${sfoFormData.id}`,
        {
          body: JSON.stringify(editPayload),
        },
      );
    });
  }, 60000);
  it("it edits a LFO Facility form", async () => {
    actionHandler.mockReturnValue({ error: null });
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

    // edit for fields
    await editFormFields(facilitiesSchemaLfo);
    // submit valid form data
    const submitButton = screen.getByRole("button", { name: /submit/i });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Your edits were saved successfully"),
      ).toBeVisible();
      expect(actionHandler).toHaveBeenCalledWith(
        `registration/facilities/${sfoFormData.id}`,
        "PUT",
        `/operations/${operationId}/facilities/${sfoFormData.id}`,
        {
          body: JSON.stringify(editPayload),
        },
      );
    });
  }, 60000);
});
