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
  useSearchParams,
  notFound,
  useParams,
  useRouter,
} from "@bciers/testConfig/mocks";
import Operations from "apps/registration/app/components/operations/Operations";
import { FrontEndRoles } from "@bciers/utils/enums";
import Facility from "apps/registration/app/components/facilities/Facility";
import FacilitiesForm from "apps/registration/app/components/facilities/FacilitiesForm";
import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "apps/registration/app/utils/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "apps/registration/app/utils/jsonSchema/facilitiesLfo";

const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";
const facilityId = "025328a0-f9e8-4e1a-888d-aa192cb053db";
("025328a0-f9e8-4e1a-888d-aa192cb053db");
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
  section1: {
    name: "Monkeyfuzz",
    type: "Single Facility Operation",
  },
  section2: {
    latitude_of_largest_emissions: "3.000000",
    longitude_of_largest_emissions: "4.000000",
    street_address: "adf",
    municipality: "ad",
    province: "BC",
    postal_code: "h0h0h0",
  },
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
};

const lfoFormData = {
  section1: {
    name: "Monkeyfuzz",
    type: "Single Facility Operation",
    well_authorization_numbers: [24546, 54321],
  },
  section2: {
    latitude_of_largest_emissions: "3.000000",
    longitude_of_largest_emissions: "4.000000",
    street_address: "adf",
    municipality: "ad",
    province: "BC",
    postal_code: "h0h0h0",
  },
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
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

    expect(screen.getByText(/Authorization+/i)).toBeVisible(); // text seems to be broken up
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

    // submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
  it.only("loads existing readonly LFO form data", async () => {
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

    // submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
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
  });
  it.only("does not allow LFO submission if there are validation errors (bad form data)", async () => {
    const { container } = render(
      <FacilitiesForm
        isCreating
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={{
          section2: {
            latitude_of_largest_emissions: -600,
            longitude_of_largest_emissions: 1800,
            postal_code: "garbage",
          },
        }}
      />,
    );

    act(() => {
      const submitButton = screen.getByRole("button", { name: /submit/i });
      submitButton.click();
    });
    expect(screen.getAllByText(/Required field/i)).toHaveLength(2); // name and type
    expect(screen.getAllByText(/Format should be A1A 1A1/i)).toHaveLength(1);
    expect(screen.getAllByText(/must be >= -90/i)).toHaveLength(1);
    expect(screen.getAllByText(/must be <= 180/i)).toHaveLength(1);
  });

  it.only("fills form, creates new SFO facility, and redirects on success", async () => {
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
      expect(screen.getByText("success")).toBeVisible();
      expect(mockReplace).toHaveBeenCalledWith(
        `/operations/${operationId}/facilities/${facilityId}`,
        {
          shallow: true,
        },
      );
    });
  });

  it("when creating a new LFO facility, posts the form on submit and redirects", async () => {
    render(
      <FacilitiesForm
        isCreating
        schema={facilitiesSchemaLfo}
        uiSchema={facilitiesUiSchema}
        formData={{}}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    act(async () => {
      fireEvent.change(screen.getByLabelText(/Facility Name+/i), {
        target: { value: "test" },
      });
      const dropdown = screen.getByLabelText(/Facility Type+/i);
      // fireEvent.change(screen.getByLabelText(/Facility Name+/i), {
      //   target: { value: "Large Facility" },
      // });
      fireEvent.click(dropdown);

      const dropdownItem = await screen.getByRole("option", {
        name: /large facility/i,
      });
      fireEvent.click(dropdownItem);
      fireEvent.click(screen.getByText("Large Facility"));
      expect(dropdown).toHaveValue("Large Facility");

      // Find the option and select it
      const option = screen.getByRole("option", {
        name: "Large Facility",
      });
      fireEvent.click(option);

      fireEvent.change(
        screen.getByLabelText(/Latitude of Largest Point of Emissions+/i),
        { target: { value: 3 } },
      );
      fireEvent.change(
        screen.getByLabelText(/Longitude of Largest Point of Emissions+/i),
        { target: { value: 6 } },
      );
      fireEvent.click(submitButton);
      // submitButton.click();
      actionHandler.mockReturnValueOnce({
        id: facilityId,
        error: null,
      });
    });
    userEvent.click(submitButton);
    // expect(consoleSpy).toHaveBeenCalledOnce();
    await waitFor(() => {
      // expect(screen.getByText("success")).toBeVisible();
    });
  });
});
