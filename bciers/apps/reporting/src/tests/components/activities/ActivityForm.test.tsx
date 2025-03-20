import { act, render, screen } from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import ActivityForm from "@reporting/src/app/components/activities/ActivityForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";

// Mock data
const mockActivityData = {
  activityId: 1,
  sourceTypeMap: {
    1: "firstTestSourceType",
    2: "secondTestSourceType",
  },
};

const mockUUID = " 00000000-0000-0000-0000-000000000001";

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
      refresh: vi.fn(),
    });
  });

  it("renders the activity schema", async () => {
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
      />,
    );
    await act(async () => {
      await flushPromises();
    });

    // Check if the source type booleans are rendered
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
      />,
    );
    await act(async () => {
      await flushPromises();
    });

    // Check if the units array within the source type schema is rendered
    expect(screen.getAllByText(/test field/i).length).toBe(1);
  });

  // Will need additional tests once we're passing formData into this component & saving formData out of it
});
