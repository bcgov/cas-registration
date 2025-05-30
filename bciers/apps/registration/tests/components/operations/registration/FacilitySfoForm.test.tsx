import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import {
  actionHandler,
  useRouter,
  useSearchParams,
  useSessionRole,
} from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import FacilitySfoForm from "apps/registration/app/components/operations/registration/FacilitySfoForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import {
  fillAddressFields,
  fillLatitudeLongitudeFields,
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

const mockPush = vi.fn();

useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const defaultProps = {
  operationId: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  formData: {},
  step: 2,
  steps: allOperationRegistrationSteps,
  isCreating: true,
};

describe("the FacilitySfoForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the SFO FacilitySfoForm component", () => {
    render(<FacilitySfoForm {...defaultProps} />);
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
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
        name: "Save and Continue",
      }),
    ).toBeVisible();
  });

  it("should render the FacilitySfoForm with SFO pre-filled fields", () => {
    const { container } = render(
      <FacilitySfoForm
        {...defaultProps}
        formData={{
          section1: {
            name: "Test Operation",
            type: "Single Facility",
            bcghg_id: 23219999999,
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

    const bcGhgId = container.querySelector("#root_section1_bcghg_id");
    expect(bcGhgId).toHaveTextContent("23219999999 BCGHG ID issued");
  });

  it(
    "should allow the user to fill out the SFO form",
    {
      timeout: 10000,
    },
    async () => {
      render(
        <FacilitySfoForm
          {...defaultProps}
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
        "registration/facilities",
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
    },
  );
});
