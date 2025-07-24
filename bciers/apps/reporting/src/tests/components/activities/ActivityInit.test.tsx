import { render } from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import ActivityInit from "@reporting/src/app/components/activities/ActivityInit";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getActivityFormData } from "@reporting/src/app/utils/getActivityFormData";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { getAllGasTypes } from "@reporting/src/app/utils/getAllGasTypes";
import { UUID } from "crypto";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

// Mock all dependencies
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("@bciers/utils/src/safeJsonParse", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getOrderedActivities", () => ({
  getOrderedActivities: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getActivityFormData", () => ({
  getActivityFormData: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportInformationTaskListData", () => ({
  getReportInformationTasklist: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getAllGasTypes", () => ({
  getAllGasTypes: vi.fn(),
}));

vi.mock("@reporting/src/app/components/activities/ActivityForm", () => ({
  default: vi.fn(() => (
    <div data-testid="activity-form">Mocked Activity Form</div>
  )),
}));

import ActivityForm from "@reporting/src/app/components/activities/ActivityForm";
const ActivityFormMock = ActivityForm as ReturnType<typeof vi.fn>;

async function renderActivityInit(props: any) {
  const ActivityInitComponent = await ActivityInit(props);
  return render(ActivityInitComponent);
}

describe("ActivityInit Component", () => {
  const versionId = 1;
  const facilityId = "00000000-0000-0000-0000-000000000001" as UUID;
  const activityId = 123;

  const mockGasTypes = [
    { id: 1, name: "CO2", chemical_formula: "CO2" },
    { id: 2, name: "CH4", chemical_formula: "CH4" },
  ];

  const mockOrderedActivities = [
    { id: 1, name: "Activity 1", slug: "activity-1" },
    { id: 2, name: "Activity 2", slug: "activity-2" },
    { id: 3, name: "Activity 3", slug: "activity-3" },
  ];

  const mockActivityData = {
    sourceTypeMap: {
      1: "sourceType1",
      2: "sourceType2",
    },
  };

  const mockFormData = {
    sourceType1: true,
    sourceType2: false,
  };

  const mockReportInfoTaskList = {
    facilityName: "Test Facility",
  };

  const mockNavigationInformation = {
    taskList: [],
    backUrl: "/back",
    continueUrl: "/continue",
    headerSteps: ["ReportInformation"],
    headerStepIndex: 0,
  };

  const mockJsonSchema = {
    schema: {
      type: "object",
      properties: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mocks
    (getAllGasTypes as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockGasTypes,
    );
    (getOrderedActivities as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrderedActivities,
    );

    (actionHandler as ReturnType<typeof vi.fn>).mockImplementation((url) => {
      if (url.includes("initial-activity-data")) {
        return Promise.resolve(mockActivityData);
      } else if (url.includes("build-form-schema")) {
        return Promise.resolve(mockJsonSchema);
      }
      return Promise.resolve({ success: true });
    });

    (safeJsonParse as ReturnType<typeof vi.fn>).mockImplementation((data) => {
      if (data === mockJsonSchema) {
        return mockJsonSchema;
      }
      return mockActivityData;
    });

    (getActivityFormData as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFormData,
    );
    (
      getReportInformationTasklist as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockReportInfoTaskList);
    (getNavigationInformation as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockNavigationInformation,
    );
  });

  describe("Activity Selection Logic", () => {
    it("should use the activity at the specified step when no activityId is provided", async () => {
      const step = 1;

      await renderActivityInit({
        versionId,
        facilityId,
        step,
      });

      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[step].id,
      );
    });

    it("should use the specified activityId when provided", async () => {
      await renderActivityInit({
        versionId,
        facilityId,
        activityId,
        step: 0,
      });

      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[0].id,
      );
    });

    it("should use the last activity when step is -1", async () => {
      const step = -1;

      await renderActivityInit({
        versionId,
        facilityId,
        step,
      });

      const lastActivityIndex = mockOrderedActivities.length - 1;
      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[lastActivityIndex].id,
      );
    });

    it("should fall back to the first activity when current activity is not found", async () => {
      const step = 999; // Invalid step

      await renderActivityInit({
        versionId,
        facilityId,
        step,
      });

      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[0].id,
      );
    });

    it("should fall back to the first activity when activityId doesn't exist", async () => {
      const nonExistentActivityId = 999;

      await renderActivityInit({
        versionId,
        facilityId,
        activityId: nonExistentActivityId,
        step: 0,
      });

      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[0].id,
      );
    });

    it("should fall back to the first activity when step is negative (other than -1)", async () => {
      const step = -5;

      await renderActivityInit({
        versionId,
        facilityId,
        step,
      });

      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[0].id,
      );
    });
  });

  describe("API Calls", () => {
    it("should fetch all required data", async () => {
      await renderActivityInit({
        versionId,
        facilityId,
        step: 0,
      });

      expect(getAllGasTypes).toHaveBeenCalled();
      expect(getOrderedActivities).toHaveBeenCalledWith(versionId, facilityId);
      expect(actionHandler).toHaveBeenCalledWith(
        expect.stringContaining("initial-activity-data"),
        "GET",
        "",
      );
      expect(getActivityFormData).toHaveBeenCalledWith(
        versionId,
        facilityId,
        mockOrderedActivities[0].id,
      );
      expect(getReportInformationTasklist).toHaveBeenCalledWith(
        versionId,
        facilityId,
      );
      expect(getNavigationInformation).toHaveBeenCalledWith(
        HeaderStep.ReportInformation,
        ReportingPage.Activities,
        versionId,
        facilityId,
        {
          facilityName: mockReportInfoTaskList.facilityName,
          orderedActivities: mockOrderedActivities,
          currentActivity: mockOrderedActivities[0],
        },
      );
    });

    it("should throw error when activity data fetch fails", async () => {
      (actionHandler as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url.includes("initial-activity-data")) {
          return Promise.resolve({ error: "API Error" });
        } else if (url.includes("build-form-schema")) {
          return Promise.resolve(mockJsonSchema);
        }
        return Promise.resolve({ success: true });
      });

      await expect(async () => {
        await renderActivityInit({
          versionId,
          facilityId,
          step: 0,
        });
      }).rejects.toThrow(
        "We couldn't find the activity data for this facility.",
      );
    });
  });

  describe("Source Type Processing", () => {
    it("should build correct source type query string based on form data", async () => {
      const mockFormDataWithSelectedSourceTypes = {
        sourceType1: true,
        sourceType2: false,
        sourceType3: true,
      };

      const mockActivityDataWithSourceTypes = {
        sourceTypeMap: {
          1: "sourceType1",
          2: "sourceType2",
          3: "sourceType3",
        },
      };

      (getActivityFormData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFormDataWithSelectedSourceTypes,
      );
      (safeJsonParse as ReturnType<typeof vi.fn>).mockImplementation((data) =>
        data === mockJsonSchema
          ? mockJsonSchema
          : mockActivityDataWithSourceTypes,
      );

      await renderActivityInit({
        versionId,
        facilityId,
        step: 0,
      });

      expect(actionHandler).toHaveBeenCalledWith(
        expect.stringContaining("&source_types[]=1&source_types[]=3"),
        "GET",
        "",
      );
    });

    it("should handle empty source type selection", async () => {
      const mockFormDataNoSelection = {
        sourceType1: false,
        sourceType2: false,
      };

      (getActivityFormData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockFormDataNoSelection,
      );

      await renderActivityInit({
        versionId,
        facilityId,
        step: 0,
      });

      expect(actionHandler).toHaveBeenCalledWith(
        expect.not.stringContaining("&source_types[]="),
        "GET",
        "",
      );
    });
  });

  describe("Component Rendering", () => {
    it("should render ActivityForm with correct props", async () => {
      const component = await renderActivityInit({
        versionId,
        facilityId,
        step: 0,
      });

      expect(component.getByTestId("activity-form")).toBeInTheDocument();
    });

    it("should pass correct props to ActivityForm", async () => {
      await renderActivityInit({
        versionId,
        facilityId,
        step: 0,
      });

      expect(ActivityFormMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activityData: mockActivityData,
          activityFormData: mockFormData,
          currentActivity: mockOrderedActivities[0],
          navigationInformation: mockNavigationInformation,
          reportVersionId: versionId,
          facilityId: facilityId,
          initialJsonSchema: mockJsonSchema.schema,
          initialSelectedSourceTypeIds: ["1"],
          gasTypes: mockGasTypes,
        }),
        {},
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully when dependencies fail", async () => {
      (getAllGasTypes as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Gas types error"),
      );

      await expect(async () => {
        await renderActivityInit({
          versionId,
          facilityId,
          step: 0,
        });
      }).rejects.toThrow("Gas types error");
    });

    it("should handle missing ordered activities", async () => {
      (getOrderedActivities as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await expect(async () => {
        await renderActivityInit({
          versionId,
          facilityId,
          step: 0,
        });
      }).rejects.toThrow();
    });
  });
});
