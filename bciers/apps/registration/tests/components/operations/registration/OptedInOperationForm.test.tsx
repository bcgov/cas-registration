import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { actionHandler, useRouter, useSession } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import { UUID } from "crypto";
import OptedInOperationForm from "@/registration/app/components/operations/registration/OptedInOperationForm";
import { optedInOperationSchema } from "@/registration/app/data/jsonSchema/operationRegistration/optedInOperation";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user",
    },
  },
});

const mockPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const defaultProps = {
  formData: {
    meets_section_3_emissions_requirements: null,
    meets_electricity_import_operation_criteria: null,
    meets_entire_operation_requirements: null,
    meets_section_6_emissions_requirements: null,
    meets_naics_code_11_22_562_classification_requirements: null,
    meets_producing_gger_schedule_a1_regulated_product: null,
    meets_reporting_and_regulated_obligations: null,
    meets_notification_to_director_on_criteria_change: null,
  },
  operation: "002d5a9e-32a6-4191-938c-2c02bfec592d" as UUID,
  step: 3,
  steps: allOperationRegistrationSteps,
  schema: optedInOperationSchema,
};

describe("the OptedInOperationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OptedInOperationForm component", () => {
    render(<OptedInOperationForm {...defaultProps} />);

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Opt-In Application",
    );

    // Preface
    const optedInOperationPrefaceView = screen.getByText(
      /complete the following fields to apply to be an opt-in operation in the b\.c\. obps\. ensure that you have read through and prior to applying\./i,
    );
    within(optedInOperationPrefaceView).getByRole("link", {
      name: /our website/i,
    });
    expect(
      screen.getByRole("link", {
        name: /our website/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system",
    );
    within(optedInOperationPrefaceView).getByRole("link", {
      name: /readiness considerations/i,
    });

    expect(
      screen.getByRole("link", {
        name: /readiness considerations/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/readiness_considerations_for_opted-in_operations.pdf",
    );

    // Questions - 1
    const meetsSection3EmissionsRequirementsView = screen.getByText(
      /does this operation have emissions that are attributable for the purposes of section 3 of \?/i,
    );
    within(meetsSection3EmissionsRequirementsView).getByRole("link", {
      name: /the act/i,
    });
    expect(
      screen.getAllByRole("link", {
        name: /the act/i,
      })[0],
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );

    // Questions - 2
    expect(
      screen.getByText(
        /is this operation an electricity import operation\?\*/i,
      ),
    ).toBeVisible();

    // Questions - 3
    expect(
      screen.getByText(
        /designation as an opt-in can only be granted to an entire operation \(i\.e\. not a part or certain segment of an operation\)\. do you confirm that the operation applying for this designation is an entire operation\?/i,
      ),
    ).toBeVisible();

    // Questions - 4
    const meetsSection6EmissionsRequirementsView = screen.getByText(
      /does this operation have emissions that are attributable for the purposes of section 6 of \?/i,
    );

    within(meetsSection6EmissionsRequirementsView).getByRole("link", {
      name: /the act/i,
    });
    expect(
      screen.getAllByRole("link", {
        name: /the act/i,
      })[1],
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );

    // Questions - 5
    const meetsNaicsCode1122562ClassificationRequirementsView =
      screen.getByText(
        /is this operation’s primary economic activity classified by the following/i,
      );

    within(meetsNaicsCode1122562ClassificationRequirementsView).getByRole(
      "link",
      {
        name: /naics code - 11, 22, or 562\?/i,
      },
    );

    expect(
      screen.getByRole("link", {
        name: /naics code - 11, 22, or 562\?/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://www.statcan.gc.ca/en/subjects/standard/naics/2022/v1/index",
    );

    // Questions - 6
    const meetsProducingGgerScheduleA1RegulatedProductView = screen.getByText(
      /does this operation produce a regulated product listed in table 2 of schedule a\.1 of \?/i,
    );
    within(meetsProducingGgerScheduleA1RegulatedProductView).getByRole("link", {
      name: /the ggerr/i,
    });

    expect(
      screen.getByRole("link", {
        name: /the ggerr/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015",
    );

    // Questions - 7
    const meetsReportingAndRegulatedObligationsView = screen.getByText(
      /is this operation capable of fulfilling the obligations of a reporting operation and a regulated operation under and the regulations\?/i,
    );
    within(meetsReportingAndRegulatedObligationsView).getByRole("link", {
      name: /the act/i,
    });
    expect(
      screen.getAllByRole("link", {
        name: /the act/i,
      })[2],
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );

    // Questions - 8
    expect(
      screen.getByText(
        /will the operator notify the director as soon as possible if this operation ceases to meet any of the criteria for the designation of the operation as a reporting operation and a regulated operation\?/i,
      ),
    );

    expect(
      screen.getByRole("button", {
        name: /save and continue/i,
      }),
    ).toBeDisabled();
  });

  it("should allow the user to answer all questions (check radio buttons) and submit the form", async () => {
    render(<OptedInOperationForm {...defaultProps} />);

    const saveAndContinueBtn = screen.getByRole("button", {
      name: /save and continue/i,
    });
    expect(saveAndContinueBtn).toBeDisabled();

    act(() => {
      const allYesRadioButtons: HTMLInputElement[] = screen.getAllByRole(
        "radio",
        {
          name: /yes/i,
        },
      );
      // answer all questions(Choose Yes)
      allYesRadioButtons.forEach((radioBtn) => {
        radioBtn.click();
      });
      allYesRadioButtons.forEach((radioBtn) => {
        expect(radioBtn).toBeChecked();
      });
      expect(saveAndContinueBtn).not.toBeDisabled();
      actionHandler.mockResolvedValueOnce({});
      saveAndContinueBtn.click();
    });
    expect(actionHandler).toHaveBeenCalledTimes(1);

    expect(actionHandler).toHaveBeenCalledWith(
      `registration/operations/${defaultProps.operation}/registration/opted-in-operation-detail`,
      "PUT",
      `/register-an-operation/${defaultProps.operation}`,
      {
        body: JSON.stringify({
          meets_section_3_emissions_requirements: true,
          meets_electricity_import_operation_criteria: true,
          meets_entire_operation_requirements: true,
          meets_section_6_emissions_requirements: true,
          meets_naics_code_11_22_562_classification_requirements: true,
          meets_producing_gger_schedule_a1_regulated_product: true,
          meets_reporting_and_regulated_obligations: true,
          meets_notification_to_director_on_criteria_change: true,
        }),
      },
    );
  });
});
