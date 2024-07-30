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
import FacilitiesForm from "apps/administration/app/components/facilities/FacilitiesForm";
import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "../../../app/data/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "../../../app/data/jsonSchema/facilitiesLfo";

const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";
const facilityId = "025328a0-f9e8-4e1a-888d-aa192cb053db";
const facilityName = "bloop";

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
  is_current_year: true,
  starting_date: "2024-07-11 02:00:00.000 -0700",
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
  is_current_year: true,
  starting_date: "2024-07-11 02:00:00.000 -0700",
};

describe("FacilitiesForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the empty SFO facility form when creating a new facility", async () => {
    render(
      <FacilitiesForm
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
      <FacilitiesForm
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
      <FacilitiesForm
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
      container.querySelector("#root_section1_is_current_year"),
    ).toHaveTextContent("Yes");
    waitFor(() =>
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
      <FacilitiesForm
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
      container.querySelector("#root_section1_is_current_year"),
    ).toHaveTextContent("Yes");
    waitFor(() =>
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
      <FacilitiesForm
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
      <FacilitiesForm
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
      <FacilitiesForm
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
  });

  it("fills the mandatory form fields, creates new SFO facility, and redirects on success", async () => {
    render(
      <FacilitiesForm
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
    // fill name
    await userEvent.type(screen.getByLabelText(/Facility Name+/i), "test");
    // fill type
    const comboBoxInput = screen.getAllByRole(
      "combobox",
    )[0] as HTMLInputElement;
    const openComboboxButton = comboBoxInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;
    await userEvent.click(openComboboxButton);
    const typeOption = screen.getByText("Single Facility Operation");
    await userEvent.click(typeOption);
    // fill year and starting date
    const year = screen.getByLabelText(/Did this facility begin operations+/i);
    await userEvent.click(year);
    await userEvent.type(
      screen.getByLabelText(/Date of facility starting operations+/i),
      "20240101",
    );

    // fill lat and long (userEvent.type doesn't work because the value goes in as a string and lat/long require a number)
    fireEvent.change(
      screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
      { target: { value: 3 } },
    );
    fireEvent.change(
      screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
      { target: { value: 6 } },
    );
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        `/operations/${operationId}/facilities/${facilityId}?facilitiesTitle=${facilityName}`,
        {
          shallow: true,
        },
      );
    });
  });
  it("fills all form fields, creates new LFO facility, and redirects on success", async () => {
    render(
      <FacilitiesForm
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
    // FILL FIELDS
    // fill name
    await userEvent.type(screen.getByLabelText(/Facility Name+/i), "test");
    // fill type
    const comboBoxInput = screen.getAllByRole("combobox");
    const openFacilityTypeDropdownButton = comboBoxInput[0]?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openFacilityTypeDropdownButton);
    const typeOption = screen.getByText("Large Facility");
    await userEvent.click(typeOption);
    // fill well authorization numbers
    await userEvent.click(screen.getByText("Add"));
    const firstWellAuthInput = screen.getAllByRole("spinbutton")[0];
    // have to use fireEvent for number fields
    fireEvent.change(firstWellAuthInput, { target: { value: 355 } });
    // fill year and starting date
    const year = screen.getByLabelText(/Did this facility begin operations+/i);
    await userEvent.click(year);
    await userEvent.type(
      screen.getByLabelText(/Date of facility starting operations+/i),
      "20240101",
    );

    await userEvent.type(screen.getByLabelText(/Street address+/i), "address");
    await userEvent.type(screen.getByLabelText(/Municipality+/i), "city");

    // province
    const openProvinceDropdownButton = comboBoxInput[1]?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openProvinceDropdownButton);
    const provinceOption = screen.getByText(/alberta/i);
    await userEvent.click(provinceOption);

    await userEvent.type(screen.getByLabelText(/Postal Code+/i), "H0H0H0");

    fireEvent.change(
      screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
      { target: { value: 48.407326 } },
    );
    fireEvent.change(
      screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
      { target: { value: -123.329773 } },
    );

    // CHECK FIELDS ARE FILLED
    expect(screen.getByLabelText(/Facility Name+/i)).toHaveValue("test");
    expect(screen.getByLabelText(/Facility Type+/i)).toHaveValue(
      "Large Facility",
    );

    expect(firstWellAuthInput).toHaveValue(355);
    expect(
      screen.getByLabelText(/Did this facility begin operations+/i),
    ).toBeChecked();
    expect(
      screen.getByLabelText(/Date of facility starting operations+/i),
    ).toHaveValue("2024-01-01");
    expect(screen.getByLabelText(/Street address+/i)).toHaveValue("address");
    expect(screen.getByLabelText(/Municipality+/i)).toHaveValue("city");
    expect(screen.getByLabelText(/Province+/i)).toHaveValue("Alberta");
    expect(screen.getByLabelText(/Postal Code+/i)).toHaveValue("H0H 0H0");
    expect(
      screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
    ).toHaveValue(48.407326);
    expect(
      screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
    ).toHaveValue(-123.329773);

    // SUBMIT
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        `/operations/${operationId}/facilities/${facilityId}?facilitiesTitle=${facilityName}`,
        {
          shallow: true,
        },
      );
    });
  });
});
