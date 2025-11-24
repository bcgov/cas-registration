import { render, act, waitFor } from "@testing-library/react";
import { actionHandler } from "@bciers/actions";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { vi } from "vitest";
import {
  FacilityReview,
  FacilityReviewFormData,
} from "@reporting/src/app/components/facility/FacilityReviewForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { buildFacilitySchema } from "@reporting/src/data/jsonSchema/facilities";

// Mocks for external dependencies
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));
vi.mock("@bciers/utils/src/serializeSearchParams", () => ({
  default: vi.fn(),
}));
// Mocking MultiStepFormWithTaskList
vi.mock("@bciers/components/form/MultiStepFormWithTaskList", () => {
  return {
    default: vi.fn(({ errors }: { errors: any[] }) => (
      <div>
        {errors && errors.length > 0 && (
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    )),
  };
});

const mockActionHandler = actionHandler as ReturnType<typeof vi.fn>;
const mockMultiStepFormWithTaskList = MultiStepFormWithTaskList as ReturnType<
  typeof vi.fn
>;

const mockActivitiesData: {
  name: string;
  id: number;
  applicable_to: string;
}[] = [{ name: "Activity 1", id: 1, applicable_to: "abc" }];
const mockSchema = { testSchema: true };

const mockFormData: FacilityReviewFormData = {
  operation_id: "1234",
  facility_name: "Test Facility",
  facility_type: "Test Type",
  facility_bcghgid: null,
  activities: ["Activity 1"],
  facility: "abcd",
};

const renderFacilityReview = (
  formData: FacilityReviewFormData = mockFormData,
) => (
  <FacilityReview
    version_id={1000}
    facility_id="abcd"
    activitiesData={mockActivitiesData}
    navigationInformation={dummyNavigationInformation}
    formsData={formData}
    schema={mockSchema}
    operationId="1234"
  />
);

const mockFormDataWithoutActivities: FacilityReviewFormData = {
  operation_id: "1234",
  facility_name: "Test Facility",
  facility_type: "Test Type",
  facility_bcghgid: null,
  activities: [],
  facility: "abcd",
};
const renderFacilityReviewWithoutActivities = (
  formData: FacilityReviewFormData = mockFormDataWithoutActivities,
) => (
  <FacilityReview
    version_id={1000}
    facility_id="abcd"
    activitiesData={mockActivitiesData}
    navigationInformation={dummyNavigationInformation}
    formsData={formData}
    schema={mockSchema}
    operationId="1234"
  />
);

describe("The FacilityReview component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls the actionHandler on form submission", async () => {
    mockActionHandler.mockResolvedValue({}); // Mocking successful response

    render(renderFacilityReview());

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await act(() => calledProps.onSubmit());

    expect(mockActionHandler).toHaveBeenCalledWith(
      "reporting/report-version/1000/facility-report/abcd",
      "POST",
      "reporting/report-version/1000/facility-report/abcd",
      {
        body: '{"operation_id":"1234","facility_name":"Test Facility","facility_type":"Test Type","facility_bcghgid":null,"activities":[1],"facility":"abcd"}',
      },
    );
  });

  it("updates the form data when onChange is called", async () => {
    render(renderFacilityReview());

    const changeHandlerUnderTest =
      mockMultiStepFormWithTaskList.mock.calls[0][0].onChange;

    await act(() =>
      changeHandlerUnderTest({
        formData: {
          operation_id: "1234",
          facility_name: "Test Facility",
          facility_type: "Test Type",
          facility_bcghgid: null,
          activities: ["Activity 1"],
          facility: "abcd",
        },
      }),
    );

    expect(mockMultiStepFormWithTaskList).toHaveBeenCalledTimes(2);
    expect(
      mockMultiStepFormWithTaskList.mock.calls[1][0].formData,
    ).toStrictEqual({
      operation_id: "1234",
      facility_name: "Test Facility",
      facility_type: "Test Type",
      facility_bcghgid: null,
      activities: ["Activity 1"],
      facility: "abcd",
    });
  });

  it("handles form errors correctly", async () => {
    mockActionHandler.mockResolvedValue({ error: "Some error occurred" });

    const { getByText } = render(renderFacilityReview());

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await act(() => calledProps.onSubmit());

    expect(mockActionHandler).toHaveBeenCalled();

    await waitFor(() => {
      expect(getByText("Some error occurred")).toBeInTheDocument();
    });
  });

  it("shows error on submit when there are no activities", async () => {
    const { getByText } = render(renderFacilityReviewWithoutActivities());

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await act(() => calledProps.onSubmit());

    await waitFor(() => {
      expect(
        getByText("You must select at least one activity"),
      ).toBeInTheDocument();
    });
    expect(mockActionHandler).not.toHaveBeenCalled();
  });

  it("includes sync button in uiSchema when isSyncAllowed is true", async () => {
    render(
      <FacilityReview
        version_id={1000}
        facility_id="abcd"
        activitiesData={mockActivitiesData}
        navigationInformation={dummyNavigationInformation}
        formsData={mockFormData}
        schema={mockSchema}
        operationId="1234"
        isSyncAllowed={true}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];

    // Verify that sync_button has the onSync function in uiSchema
    expect(calledProps.uiSchema.sync_button).toBeDefined();
    expect(calledProps.uiSchema.sync_button["ui:options"]).toBeDefined();
    expect(
      calledProps.uiSchema.sync_button["ui:options"].onSync,
    ).toBeInstanceOf(Function);
  });

  it("does not include sync button in uiSchema when isSyncAllowed is false", async () => {
    render(
      <FacilityReview
        version_id={1000}
        facility_id="abcd"
        activitiesData={mockActivitiesData}
        navigationInformation={dummyNavigationInformation}
        formsData={mockFormData}
        schema={mockSchema}
        operationId="1234"
        isSyncAllowed={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];

    // Verify that sync_button does not have the onSync function in uiSchema when isSyncAllowed is false
    expect(
      calledProps.uiSchema.sync_button["ui:options"]?.onSync,
    ).toBeUndefined();
  });

  it("schema includes info_note and sync_button when isSyncAllowed is true", () => {
    const schemaWithSync = buildFacilitySchema(mockActivitiesData, true);

    // Verify info_note and sync_button are in the schema properties
    expect(schemaWithSync.properties?.info_note).toBeDefined();
    expect(schemaWithSync.properties?.sync_button).toBeDefined();
  });

  it("schema excludes info_note and sync_button when isSyncAllowed is false", () => {
    const schemaWithoutSync = buildFacilitySchema(mockActivitiesData, false);

    // Verify info_note and sync_button are NOT in the schema properties
    expect(schemaWithoutSync.properties?.info_note).toBeUndefined();
    expect(schemaWithoutSync.properties?.sync_button).toBeUndefined();
  });
});
