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
  useSession,
} from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import NewLfoFacilityForm from "@/registration/app/components/operations/registration/NewLfoFacilityForm";
import {
  fillAddressFields,
  fillLatitudeLongitudeFields,
  fillNameAndTypeFields,
  toggleAndFillStartDate,
} from "./utils";

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

const mockPush = vi.fn();

useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const defaultProps = {
  formData: {},
  operationId: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  setFacilityFormIsSubmitting: vi.fn(),
  onSuccess: vi.fn(),
};

describe("the NewLfoFacilityForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "should allow the user to fill and submit the LFO form",
    {
      timeout: 20000,
    },
    async () => {
      render(<NewLfoFacilityForm {...defaultProps} />);

      const addButton = screen.getByRole("button", {
        name: "Add New Facility",
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
      actionHandler.mockResolvedValueOnce([
        {
          error: null,
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
    },
  );

  it("should show an alert if there's an error", async () => {
    actionHandler.mockResolvedValueOnce({
      error: "a problem",
    });
    render(<NewLfoFacilityForm {...defaultProps} />);

    const addFacilityButton = screen.getByRole("button", {
      name: "Add New Facility",
    });

    act(() => {
      fireEvent.click(addFacilityButton);
    });

    const saveButton = screen.getByRole("button", {
      name: "Save",
    });

    act(() => {
      fireEvent.click(saveButton);
    });

    expect(actionHandler).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeVisible();
    });
  });
});
