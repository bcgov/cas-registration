import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import ActivityForm from "@reporting/src/app/components/activities/ActivityForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";
import { RJSFSchema } from "@rjsf/utils";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { getActivitySchema } from "@reporting/src/app/utils/getActivitySchema";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

vi.mock("@bciers/components/form/MultiStepFormWithTaskList", () => ({
  default: vi.fn(() => null),
}));

vi.mock("@reporting/src/app/utils/getActivitySchema", () => ({
  getActivitySchema: vi.fn(),
}));

const mockMultiStepFormWithTaskList = MultiStepFormWithTaskList as ReturnType<
  typeof vi.fn
>;
const mockGetActivitySchema = getActivitySchema as ReturnType<typeof vi.fn>;

const mockActivityData = {
  activityId: 1,
  sourceTypeMap: {
    1: "firstTestSourceType",
    2: "secondTestSourceType",
  },
};

const mockGasTypes = {
  id: 1,
  name: "Methane",
  chemical_formula: "CH4",
  cas_number: "74-82-8",
};

const initialSchema: RJSFSchema = {
  type: "object",
  title: "Activity Test Schema",
  properties: {
    firstTestSourceType: {
      type: "boolean",
      title: "First Test Source Type",
    },
    secondTestSourceType: {
      type: "boolean",
      title: "Second Test Source Type",
    },
  },
};

describe("ActivityForm missing source type selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useRouter.mockReturnValue({
      push: vi.fn(),
      refresh: vi.fn(),
    });

    mockGetActivitySchema.mockResolvedValue(
      JSON.stringify({ schema: initialSchema }),
    );
  });

  it("clears missing source type error after selecting a source type", async () => {
    render(
      <ActivityForm
        activityData={mockActivityData}
        currentActivity={{
          id: 1,
          name: "Test Activity",
          slug: "electronics_manufacturing",
        }}
        navigationInformation={dummyNavigationInformation}
        activityFormData={{}}
        initialJsonSchema={initialSchema}
        reportVersionId={1}
        facilityId={"00000000-0000-0000-0000-000000000001"}
        initialSelectedSourceTypeIds={[]}
        gasTypes={mockGasTypes}
        reportingYear={2024}
        activityIndex={0}
      />,
    );

    const initialProps = mockMultiStepFormWithTaskList.mock.calls[0][0];

    await act(async () => {
      await initialProps.onSubmit({ formData: {} }, false);
    });

    const afterSubmitProps =
      mockMultiStepFormWithTaskList.mock.calls[
        mockMultiStepFormWithTaskList.mock.calls.length - 1
      ][0];

    expect(afterSubmitProps.errors).toHaveLength(1);
    expect(afterSubmitProps.errors[0].props.errors).toEqual([
      createGenericReportValidationError(
        "At least one source type must be selected to report for that activity.",
      ),
    ]);

    await act(async () => {
      afterSubmitProps.onChange({
        formData: {
          firstTestSourceType: true,
        },
      });
    });

    await waitFor(() => {
      const afterChangeProps =
        mockMultiStepFormWithTaskList.mock.calls[
          mockMultiStepFormWithTaskList.mock.calls.length - 1
        ][0];

      expect(afterChangeProps.errors).toBeUndefined();
    });
  });
});
