import { render, act, waitFor } from "@testing-library/react";
import { actionHandler } from "@bciers/actions";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { vi } from "vitest";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import FacilityReview from "@reporting/src/app/components/facility/FacilityReviewForm";

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

describe("The FacilityReview component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls the actionHandler on form submission", async () => {
    const mockActivitiesData: {
      name: string;
      id: number;
      applicable_to: string;
    }[] = [{ name: "Activity 1", id: 1, applicable_to: "abc" }];
    const mockFormData = { activities: ["Activity 1"] };
    const mockTaskListElements: TaskListElement[] = [];
    const mockSchema = { testSchema: true };

    mockActionHandler.mockResolvedValue({}); // Mocking successful response

    render(
      <FacilityReview
        version_id={1000}
        facility_id="abcd"
        activitiesData={mockActivitiesData}
        taskListElements={mockTaskListElements}
        formsData={mockFormData}
        schema={mockSchema}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await act(() => calledProps.onSubmit());

    expect(mockActionHandler).toHaveBeenCalledWith(
      "reporting/report-version/1000/facility-report/abcd",
      "POST",
      "reporting/report-version/1000/facility-report/abcd",
      { body: '{"activities":["1"]}' },
    );
  });

  it("updates the form data when onChange is called", async () => {
    const mockActivitiesData: {
      name: string;
      id: number;
      applicable_to: string;
    }[] = [{ name: "Activity 1", id: 1, applicable_to: "abc" }];
    const mockFormData = { activities: [] };
    const mockTaskListElements: TaskListElement[] = [];
    const mockSchema = { testSchema: true };

    render(
      <FacilityReview
        version_id={1000}
        facility_id="abcd"
        activitiesData={mockActivitiesData}
        taskListElements={mockTaskListElements}
        formsData={mockFormData}
        schema={mockSchema}
      />,
    );

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
    const mockActivitiesData: {
      name: string;
      id: number;
      applicable_to: string;
    }[] = [{ name: "Activity 1", id: 1, applicable_to: "abc" }];
    const mockFormData = { activities: ["Activity 1"] };
    const mockTaskListElements: TaskListElement[] = [];
    const mockSchema = { testSchema: true };

    mockActionHandler.mockResolvedValue({ error: "Some error occurred" });

    const { getByText } = render(
      <FacilityReview
        version_id={1000}
        facility_id="abcd"
        activitiesData={mockActivitiesData}
        taskListElements={mockTaskListElements}
        formsData={mockFormData}
        schema={mockSchema}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await act(() => calledProps.onSubmit());

    expect(mockActionHandler).toHaveBeenCalled();

    await waitFor(() => {
      expect(getByText("Some error occurred")).toBeInTheDocument();
    });
  });
});
