import { act, render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import ActivityForm from "@reporting/src/app/components/activities/ActivityForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";
import { RJSFSchema } from "@rjsf/utils";

// Mock data
const mockActivityData = {
  activityId: 1,
  sourceTypeMap: {
    1: "firstTestSourceType",
    2: "secondTestSourceType",
  },
};

const fallbackSchema: RJSFSchema = {
  isFallbackSchema: true,
  type: "object",
  title: "Fallback Schema",
  properties: {},
};

const mockGasTypes = {
  id: 1,
  name: "Methane",
  chemical_formula: "CH4",
  cas_number: "74-82-8",
};

const mockUUID = "00000000-0000-0000-0000-000000000001";

const activitySchema = {
  schema: {
    type: "object",
    title: "General stationary combustion excluding line tracing",
    properties: {
      firstTestSourceType: {
        type: "boolean",
        title: "First Test Source Type Title",
      },
      secondTestSourceType: {
        type: "boolean",
        title: "Second Title",
      },
    },
  },
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("ActivityForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({
      push: vi.fn(), // Mock the push function
      refresh: vi.fn(),
    });
  });

  it("renders the activity schema", async () => {
    await act(async () => {
      render(
        <ActivityForm
          activityData={mockActivityData}
          currentActivity={{
            id: 1,
            name: "General stationary combustion excluding line tracing",
            slug: "gsc_excluding_line_tracing",
          }}
          navigationInformation={dummyNavigationInformation}
          activityFormData={{}}
          initialJsonSchema={activitySchema}
          reportVersionId={1}
          facilityId={mockUUID}
          initialSelectedSourceTypeIds={[]}
          gasTypes={mockGasTypes}
        />,
      );
      await flushPromises();
    });

    expect(screen.getAllByText(/First Test Source Type Title/i).length).toBe(1);
    expect(screen.getAllByText(/Second Title/i).length).toBe(1);
  });

  it("renders the sourceType schema", async () => {
    const sourceTypeSchema = {
      schema: {
        type: "object",
        title: "General stationary combustion excluding line tracing",
        properties: {
          firstTestSourceType: {
            type: "boolean",
            title: "First Test Source Type Title",
          },
          secondTestSourceType: {
            type: "boolean",
            title: "Second Title",
          },
          sourceTypes: {
            type: "object",
            title: "source types",
            properties: {
              units: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    test: {
                      type: "string",
                      title: "test field",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await act(async () => {
      render(
        <ActivityForm
          activityData={mockActivityData}
          currentActivity={{
            id: 1,
            name: "General stationary combustion excluding line tracing",
            slug: "gsc_excluding_line_tracing",
          }}
          navigationInformation={dummyNavigationInformation}
          activityFormData={{}}
          initialJsonSchema={sourceTypeSchema}
          reportVersionId={1}
          facilityId={mockUUID}
          initialSelectedSourceTypeIds={[]}
          gasTypes={mockGasTypes}
        />,
      );
      await flushPromises();
    });

    expect(screen.getAllByText(/test field/i).length).toBe(1);
  });

  it("renders the fallback schema and skips submit", async () => {
    const mockSubmitHandler = vi.fn();

    await act(async () => {
      render(
        <ActivityForm
          activityData={mockActivityData}
          currentActivity={{
            id: 1,
            name: "Fallback Activity",
            slug: "fallback_activity",
          }}
          navigationInformation={dummyNavigationInformation}
          activityFormData={{}}
          initialJsonSchema={fallbackSchema}
          reportVersionId={1}
          facilityId={mockUUID}
          initialSelectedSourceTypeIds={[]}
          gasTypes={mockGasTypes}
        />,
      );
      await flushPromises();
    });

    expect(screen.getByText(/Continue/i)).toBeInTheDocument();

    const continueButton = screen.getByText(/Continue/i);
    fireEvent.click(continueButton);

    expect(mockSubmitHandler).not.toHaveBeenCalled();
  });
});
