import { act, fireEvent, render, screen } from "@testing-library/react";
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
    operationsTitle: "Test Operation",
    step: 3,
  },
  get: vi.fn(),
});

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
  fireEvent.change(screen.getAllByLabelText(/Province/i)[index], {
    target: { value: "BC" },
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
  step: 3,
  steps: allOperationRegistrationSteps,
  initialGridData: { rows: [], row_count: 0 },
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
      "registration/facility",
      "POST",
      "",
      {
        body: JSON.stringify({
          name: "Test Operation",
          type: "Single Facility",
          is_current_year: true,
          starting_date: "2024-01-01T09:00:00.000Z",
          street_address: "123 Test St",
          municipality: "Test City",
          postal_code: "V8X3K1",
          latitude_of_largest_emissions: 0.1,
          longitude_of_largest_emissions: 0.1,
          operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        }),
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
      "registration/facilities",
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
            postal_code: "V8X3K1",
            latitude_of_largest_emissions: 0.1,
            longitude_of_largest_emissions: 0.1,
            operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
          },
        ]),
      },
    );
  });

  it("should allow the user to fill out multiple LFO forms", async () => {
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

    const mockData = {
      name: "Test Facility",
      type: "Large Facility",
      well_authorization_numbers: [],
      is_current_year: true,
      starting_date: "2024-01-01T09:00:00.000Z",
      street_address: "123 Test St",
      municipality: "Test City",
      postal_code: "V8X3K1",
      latitude_of_largest_emissions: 0.1,
      longitude_of_largest_emissions: 0.1,
      operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
    };

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/facilities",
      "POST",
      "",
      {
        body: JSON.stringify([mockData, mockData]),
      },
    );
  });
});
