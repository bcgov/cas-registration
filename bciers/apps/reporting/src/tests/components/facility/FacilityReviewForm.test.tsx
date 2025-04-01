import { render, act, waitFor } from "@testing-library/react";
import { actionHandler } from "@bciers/actions";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { vi } from "vitest";
import FacilityReview from "@reporting/src/app/components/facility/FacilityReviewForm";
import { dummyNavigationInformation } from "../taskList/utils";

// Mocks for external dependencies
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));
vi.mock("@bciers/utils/src/serializeSearchParams", () => ({
  default: vi.fn(),
}));
// Mocking MultiStepFormWithTaskList
vi.mock("@bciers/components/form/MultiStepFormWithTaskList", () => ({
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
const mockFormData = { activities: ["Activity 1"] };

const renderFacilityReview = (formData = mockFormData) => (
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
      { body: '{"activities":[1]}' },
    );
  });

  it("updates the form data when onChange is called", async () => {
    render(renderFacilityReview());

    const changeHandlerUnderTest =
      mockMultiStepFormWithTaskList.mock.calls[0][0].onChange;

    await act(() =>
      changeHandlerUnderTest({
        formData: { activities: ["Activity 1"] },
      }),
    );

    expect(mockMultiStepFormWithTaskList).toHaveBeenCalledTimes(2);
    expect(
      mockMultiStepFormWithTaskList.mock.calls[1][0].formData,
    ).toStrictEqual({
      activities: ["Activity 1"],
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
});
