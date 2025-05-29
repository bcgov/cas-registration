import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import {
  actionHandler,
  useRouter,
  useSearchParams,
  useSessionRole,
} from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import FacilityLfoForm from "apps/registration/app/components/operations/registration/FacilityLfoForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import {
  fillAddressFields,
  fillLatitudeLongitudeFields,
  fillNameAndTypeFields,
  toggleAndFillStartDate,
} from "./utils";

useSessionRole.mockReturnValue("industry_user_admin");

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
  row_count: 2,
};

const mockPush = vi.fn();

useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const step = 2;
const operationId = "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID;
const defaultProps = {
  operationId,
  operationName: "Vitest Operation",
  formData: {},
  step,
  steps: allOperationRegistrationSteps,
  initialGridData: { rows: [], row_count: 0 },
};

describe("the FacilityLfoForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the FacilityLfoForm component", () => {
    render(<FacilityLfoForm {...defaultProps} />);
    expect(
      screen.getByRole("button", {
        name: /add new facility/i,
      }),
    ).toBeVisible();
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
    expect(
      screen.getByRole("button", {
        name: "Cancel",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Back",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Continue",
      }),
    ).toBeVisible();
  });

  it("should render the Facility DataGrid with no data", () => {
    render(<FacilityLfoForm {...defaultProps} />);

    expect(screen.getByText(/No records found/i)).toBeVisible();
  });

  it("should render the Facility DataGrid with the initial data", () => {
    render(
      <FacilityLfoForm
        {...defaultProps}
        initialGridData={facilityInitialData as any}
      />,
    );

    expect(screen.getAllByRole("gridcell")[0]).toHaveTextContent("Facility 1");
    expect(screen.getAllByRole("gridcell")[1]).toHaveTextContent(
      "Large Facility",
    );
  });

  it("submit button is disabled if there are no facilities", async () => {
    render(<FacilityLfoForm {...defaultProps} />);
    const continueButton = screen.getByRole("button", {
      name: "Continue",
    });

    expect(continueButton).toBeDisabled();
  });

  it("should direct the user to the next page of the form when they click submit", async () => {
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
      <FacilityLfoForm
        {...defaultProps}
        initialGridData={facilityInitialData as any}
      />,
    );

    await waitFor(() => {
      expect(window.location.href).toBe(`${origin}${path}/2`);
    });

    const submitButton = screen.getByRole("button", {
      name: "Continue",
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(window.location.href).toBe(`${origin}${path}/3`);
    });
  });

  it(
    "should update the grid when a user adds a new facility",
    { timeout: 100000 },
    async () => {
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
      render(<FacilityLfoForm {...defaultProps} />);
      const addButton = screen.getByRole("button", {
        name: /add new facility/i,
      });

      act(() => {
        fireEvent.click(addButton);
      });

      fillNameAndTypeFields(0);

      await toggleAndFillStartDate(0, "20240101");

      fillAddressFields(0);

      fillLatitudeLongitudeFields(0);

      const saveButton = screen.getByRole("button", {
        name: "Save",
      });
      // this is mocking the response from the onSuccess
      actionHandler.mockResolvedValue([
        {
          id: "d343c343-eb5b-4fe2-b613-75c675eee0af",
          name: "sghssg",
          type: "Large Facility",
          status: "Active",
          latitude_of_largest_emissions: 0.1,
          longitude_of_largest_emissions: 0.1,
          bcghg_id: "BC123",
        },
      ]);

      act(() => {
        fireEvent.click(saveButton);
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
              street_address: "123 Test St",
              municipality: "Test City",
              province: "BC",
              postal_code: "V8X3K1",
              latitude_of_largest_emissions: 0.1,
              longitude_of_largest_emissions: 0.1,
              well_authorization_numbers: [],
              is_current_year: true,
              starting_date: "2024-01-01T09:00:00.000Z",
              operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
            },
          ]),
        },
      );

      await waitFor(() => {
        expect(screen.getAllByRole("gridcell")[0]).toHaveTextContent("sghssg");
      });

      const continueButton = screen.getByRole("button", {
        name: "Continue",
      });

      act(() => {
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        expect(window.location.href).toBe(`${origin}${path}/3`);
      });
    },
  );
  it(
    "should allow creation of new facility if one exists",
    { timeout: 100000 },
    async () => {
      render(
        <FacilityLfoForm
          {...defaultProps}
          initialGridData={facilityInitialData as any}
        />,
      );

      const addButton = screen.getByRole("button", {
        name: /add new facility/i,
      });

      act(() => {
        fireEvent.click(addButton);
      });

      fireEvent.change(screen.getAllByLabelText(/Facility Name*/i)[0], {
        target: { value: "Test Facility" },
      });
      const comboBoxInput = screen.getAllByLabelText(/Facility Type*/i)[0];
      fireEvent.mouseDown(comboBoxInput);
      const comboBoxOption = screen.getByText("Small Aggregate");
      fireEvent.click(comboBoxOption);

      actionHandler.mockResolvedValue([
        {
          // partial mock
          id: "d343c343-eb5b-4fe2-b613-75c675eee0af",
          name: "Test Facility",
        },
      ]);
      const saveButton = screen.getByRole("button", {
        name: "Save",
      });

      act(() => {
        fireEvent.click(saveButton);
      });
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/facilities",
        "POST",
        "",
        {
          body: JSON.stringify([
            {
              name: "Test Facility",
              type: "Small Aggregate",
              operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
            },
          ]),
        },
      );
      expect(screen.getAllByRole("row")).toHaveLength(4); // 2 existing facilities + the new one + header
    },
  );
});
