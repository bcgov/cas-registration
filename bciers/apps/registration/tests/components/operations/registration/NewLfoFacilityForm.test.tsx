import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import {
  actionHandler,
  useRouter,
  useSearchParams,
  useSessionRole,
} from "@bciers/testConfig/mocks";
import { UUID } from "crypto";
import NewLfoFacilityForm from "@/registration/app/components/operations/registration/NewLfoFacilityForm";
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
  step: 2,
};

const currentYear = new Date().getFullYear();

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

      await toggleAndFillStartDate(0, `${currentYear}0101`);

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
        "/registration/register-an-operation/002d5a9e-32a6-4191-938c-2c02bfec592d/2",
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
              is_current_year: true,
              starting_date: `${currentYear}-01-01T09:00:00.000Z`,
              operation_id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
            },
          ]),
        },
      );
    },
  );

  it("displays an error message when the create request fails", async () => {
    const errorMessage = "Unable to complete the request.";
    actionHandler.mockResolvedValueOnce({
      error: errorMessage,
    });
    render(<NewLfoFacilityForm {...defaultProps} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Add New Facility",
      }),
    );
    fillNameAndTypeFields(0);
    await toggleAndFillStartDate(0, `${currentYear}0101`);
    fillAddressFields(0);
    fillLatitudeLongitudeFields(0);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );
    expect(await screen.findByText(errorMessage)).toBeVisible();
    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/facilities",
      "POST",
      `/registration/register-an-operation/${defaultProps.operationId}/${defaultProps.step}`,
      expect.anything(),
    );
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.setFacilityFormIsSubmitting).toHaveBeenCalledWith(true);
    expect(defaultProps.setFacilityFormIsSubmitting).toHaveBeenCalledWith(
      false,
    );
    expect(
      screen.getByRole("button", {
        name: "Save",
      }),
    ).toBeVisible();
    expect(screen.queryByText("Facility added")).not.toBeInTheDocument();
  });
});
