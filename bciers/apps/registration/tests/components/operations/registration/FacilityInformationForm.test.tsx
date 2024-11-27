import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import React from "react";
import {
  actionHandler,
  useRouter,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import extractParams from "apps/administration/tests/components/helpers/extractParams";

const mockReplace = vi.spyOn(global.history, "replaceState");

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

useSearchParams.mockReturnValue({
  searchParams: {
    operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
    operations_title: "Test Operation",
    step: 2,
  },
  get: vi.fn(),
});

const facilityInitialData = {
  rows: [
    {
      id: "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
      facility__name: "Facility 1",
      is_current_year: null,
      starting_date: null,
      facility__type: "Large Facility",
      facility__bcghg_id__id: null,
    },
    {
      id: "f486f2fb-62ed-438d-bb3e-0819b51e3aec",
      facility__name: "Facility 3",
      is_current_year: null,
      starting_date: null,
      facility__type: "Medium LFO",
      facility__bcghg_id__id: "23219990007",
    },
  ],
  row_count: 20,
};

const mockPush = vi.fn();

useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const toggleAndFillStartDate = async (index: number, date: string) => {
  const facilityToggle = screen.getAllByLabelText(
    /Did this facility begin operations in+/i,
  )[index];
  expect(facilityToggle).not.toBeChecked();

  act(() => {
    fireEvent.click(facilityToggle);
  });

  expect(facilityToggle).toBeChecked();
  const facilityStartDate = screen.getAllByLabelText(
    /Date of facility starting operations+/i,
  )[index];

  await userEvent.type(facilityStartDate, date);
};

const fillAddressFields = (index: number) => {
  fireEvent.change(screen.getAllByLabelText(/Street Address/i)[index], {
    target: { value: "123 Test St" },
  });
  fireEvent.change(screen.getAllByLabelText(/Municipality/i)[index], {
    target: { value: "Test City" },
  });
  fireEvent.change(screen.getAllByLabelText(/Postal Code/i)[index], {
    target: { value: "V8X3K1" },
  });
};

const fillNameAndTypeFields = (index: number) => {
  fireEvent.change(screen.getAllByLabelText(/Facility Name*/i)[index], {
    target: { value: "Test Facility" },
  });
  const comboBoxInput = screen.getAllByLabelText(/Facility Type*/i)[index];
  fireEvent.mouseDown(comboBoxInput);
  const comboBoxOption = screen.getByText("Large Facility");
  fireEvent.click(comboBoxOption);
};

const fillLatitudeLongitudeFields = (index: number) => {
  fireEvent.change(
    screen.getAllByLabelText(/Latitude of Largest Point of Emissions+/i)[index],
    { target: { value: 0.1 } },
  );
  fireEvent.change(
    screen.getAllByLabelText(/Longitude of Largest Point of Emissions+/i)[
      index
    ],
    { target: { value: 0.1 } },
  );
};

const defaultProps = {
  formData: {},
  operation: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  step: 2,
  steps: allOperationRegistrationSteps,
  initialGridData: { rows: [], row_count: 0 },
  isCreating: true,
  isOperationSfo: false,
};

describe("the FacilityInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the FacilityInformationForm component", () => {
    render(<FacilityInformationForm {...defaultProps} />);

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });

  it("should render the FacilityInformationForm with SFO pre-filled fields", () => {
    const { container } = render(
      <FacilityInformationForm
        {...defaultProps}
        isOperationSfo
        formData={{
          section1: {
            name: "Test Operation",
            type: "Single Facility",
          },
        }}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );

    const facilityName = container.querySelector("#root_section1_name");
    expect(facilityName).toHaveTextContent("Test Operation");

    const facilityType = container.querySelector("#root_section1_type");
    expect(facilityType).toHaveTextContent("Single Facility");
  });

  it("should allow the user to fill out the SFO form", async () => {
    render(
      <FacilityInformationForm
        {...defaultProps}
        isOperationSfo
        formData={{
          section1: {
            name: "Test Operation",
            type: "Single Facility",
          },
        }}
      />,
    );

    await toggleAndFillStartDate(0, "20240101");

    fillAddressFields(0);

    fillLatitudeLongitudeFields(0);

    const submitButton = screen.getByRole("button", {
      name: "Save and Continue",
    });
    actionHandler.mockResolvedValueOnce({
      error: null,
    });
    act(() => {
      fireEvent.click(submitButton);
    });

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/v2/facilities",
      "POST",
      "",
      {
        body: JSON.stringify([
          {
            name: "Test Operation",
            type: "Single Facility",
            is_current_year: true,
            starting_date: "2024-01-01T09:00:00.000Z",
            street_address: "123 Test St",
            municipality: "Test City",
            province: "BC",
            postal_code: "V8X3K1",
            latitude_of_largest_emissions: 0.1,
            longitude_of_largest_emissions: 0.1,
            operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
          },
        ]),
      },
    );
  });

  it("should allow the user to fill out the LFO form", async () => {
    render(<FacilityInformationForm {...defaultProps} />);

    const addButton = screen.getByRole("button", {
      name: "Add facility",
    });

    act(() => {
      fireEvent.click(addButton);
    });

    fillNameAndTypeFields(0);

    await toggleAndFillStartDate(0, "20240101");

    fillAddressFields(0);

    fillLatitudeLongitudeFields(0);

    const submitButton = screen.getByRole("button", {
      name: "Save and Continue",
    });
    actionHandler.mockResolvedValueOnce({
      error: null,
    });
    act(() => {
      fireEvent.click(submitButton);
    });

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/v2/facilities",
      "POST",
      "",
      {
        body: JSON.stringify([
          {
            name: "Test Facility",
            type: "Large Facility",
            well_authorization_numbers: [],
            is_current_year: true,
            starting_date: "2024-01-01T09:00:00.000Z",
            street_address: "123 Test St",
            municipality: "Test City",
            province: "BC",
            postal_code: "V8X3K1",
            latitude_of_largest_emissions: 0.1,
            longitude_of_largest_emissions: 0.1,
            operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
          },
        ]),
      },
    );
  });

  it(
    "should allow the user to fill out multiple LFO forms",
    {
      timeout: 20000,
    },
    async () => {
      render(<FacilityInformationForm {...defaultProps} />);

      const addButton = screen.getByRole("button", {
        name: "Add facility",
      });

      act(() => {
        fireEvent.click(addButton);
      });

      fillNameAndTypeFields(0);

      await toggleAndFillStartDate(0, "20240101");

      fillAddressFields(0);

      fillLatitudeLongitudeFields(0);

      // Add another Facility
      act(() => {
        fireEvent.click(addButton);
      });

      fillNameAndTypeFields(1);

      await toggleAndFillStartDate(1, "20240101");

      fillAddressFields(1);

      fillLatitudeLongitudeFields(1);

      const submitButton = screen.getByRole("button", {
        name: "Save and Continue",
      });
      actionHandler.mockResolvedValueOnce({
        error: null,
      });
      act(() => {
        fireEvent.click(submitButton);
      });

      const expectedMockData = {
        name: "Test Facility",
        type: "Large Facility",
        well_authorization_numbers: [],
        is_current_year: true,
        starting_date: "2024-01-01T09:00:00.000Z",
        street_address: "123 Test St",
        municipality: "Test City",
        province: "BC",
        postal_code: "V8X3K1",
        latitude_of_largest_emissions: 0.1,
        longitude_of_largest_emissions: 0.1,
        operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
      };

      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/facilities",
        "POST",
        "",
        {
          body: JSON.stringify([expectedMockData, expectedMockData]),
        },
      );
    },
  );

  it("should display the Facility DataGrid", () => {
    render(<FacilityInformationForm {...defaultProps} />);
    expect(
      screen.getByRole("columnheader", { name: "Facility Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Facility Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
  });

  it("should render the Facility DataGrid with no data", () => {
    render(<FacilityInformationForm {...defaultProps} />);

    expect(screen.getByText(/No records found/i)).toBeVisible();
  });

  it("should render the Facility DataGrid with the initial data", () => {
    render(
      <FacilityInformationForm
        {...defaultProps}
        initialGridData={facilityInitialData as any}
      />,
    );

    expect(screen.getAllByRole("gridcell")[0]).toHaveTextContent("Facility 1");
    expect(screen.getAllByRole("gridcell")[1]).toHaveTextContent(
      "Large Facility",
    );
  });

  it("should keep form data when sorting and filtering the Facility datagrid", async () => {
    render(
      <FacilityInformationForm
        {...defaultProps}
        initialGridData={facilityInitialData as any}
      />,
    );

    const addButton = screen.getByRole("button", {
      name: "Add facility",
    });

    act(() => {
      fireEvent.click(addButton);
    });

    fillAddressFields(0);

    const streetAddress = screen.getByLabelText(/Street Address/i);

    expect(streetAddress).toHaveValue("123 Test St");

    // click on the first column header
    const facilityNameHeader = screen.getByRole("columnheader", {
      name: "Facility Name",
    });

    act(() => {
      facilityNameHeader.click();
    });

    const searchInput = screen.getAllByPlaceholderText(/Search/i)[0]; // facility name search input
    expect(searchInput).toBeVisible();
    searchInput.focus();
    act(() => {
      fireEvent.change(searchInput, { target: { value: "facility 1" } });
    });
    expect(searchInput).toHaveValue("facility 1");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });

    await waitFor(() => {
      // check that the API call was made with the correct params
      expect(
        extractParams(String(mockReplace.mock.calls), "facility__name"),
      ).toBe("facility 1");
    });

    expect(streetAddress).toHaveValue("123 Test St");
  });

  it("should direct the user to the next page of the form on successful submit", async () => {
    window = Object.create(window);
    const origin = "http://localhost:3000";
    const path = `/registration/register-an-operation/002d5a9e-32a6-4191-938c-2c02bfec592d`;
    Object.defineProperty(window, "location", {
      value: {
        href: `${origin}${path}/2`,
        origin,
      },
      writable: true,
    });
    render(
      <FacilityInformationForm
        {...defaultProps}
        initialGridData={facilityInitialData as any}
      />,
    );

    await waitFor(() => {
      expect(window.location.href).toBe(`${origin}${path}/2`);
    });

    const submitButton = screen.getByRole("button", {
      name: "Save and Continue",
    });

    actionHandler.mockResolvedValueOnce({
      error: null,
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(window.location.href).toBe(`${origin}${path}/3`);
    });
  });
});
