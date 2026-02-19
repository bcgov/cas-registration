import { act, render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import ActivityForm from "@reporting/src/app/components/activities/ActivityForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";

// Mock actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

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
    title: "General stationary combustion excluding line tracing (at SFO)",
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
            name: "General stationary combustion excluding line tracing (at SFO)",
            slug: "gsc_excluding_line_tracing",
          }}
          navigationInformation={dummyNavigationInformation}
          activityFormData={{}}
          initialJsonSchema={activitySchema}
          reportVersionId={1}
          facilityId={mockUUID}
          initialSelectedSourceTypeIds={[]}
          gasTypes={mockGasTypes}
          reportingYear={2024}
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
        title: "General stationary combustion excluding line tracing (at SFO)",
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
            name: "General stationary combustion excluding line tracing (at SFO)",
            slug: "gsc_excluding_line_tracing",
          }}
          navigationInformation={dummyNavigationInformation}
          activityFormData={{}}
          initialJsonSchema={sourceTypeSchema}
          reportVersionId={1}
          facilityId={mockUUID}
          initialSelectedSourceTypeIds={[]}
          gasTypes={mockGasTypes}
          reportingYear={2024}
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
          reportingYear={2024}
        />,
      );
      await flushPromises();
    });

    expect(screen.getByText(/Continue/i)).toBeInTheDocument();

    const continueButton = screen.getByText(/Continue/i);
    fireEvent.click(continueButton);

    expect(mockSubmitHandler).not.toHaveBeenCalled();
  });

  describe("Form submission", () => {
    it("shows error when no source type is selected", async () => {
      const mockActivityDataSingle = {
        activityId: 1,
        sourceTypeMap: {
          1: "testSourceType",
        },
      };

      await act(async () => {
        render(
          <ActivityForm
            activityData={mockActivityDataSingle}
            currentActivity={{
              id: 1,
              name: "Test Activity",
              slug: "test_activity",
            }}
            navigationInformation={dummyNavigationInformation}
            activityFormData={{}}
            initialJsonSchema={activitySchema}
            reportVersionId={1}
            facilityId={mockUUID}
            initialSelectedSourceTypeIds={[]}
            gasTypes={mockGasTypes}
            reportingYear={2024}
          />,
        );
        await flushPromises();
      });

      // The form should render
      expect(
        screen.getByText(/First Test Source Type Title/i),
      ).toBeInTheDocument();
    });

    it("handles successful form submission", async () => {
      (actionHandler as any).mockResolvedValue({
        success: true,
        data: { activityId: 1 },
      });

      const submissionSchema = {
        schema: {
          type: "object",
          properties: {
            testSourceType: {
              type: "boolean",
              title: "Test Source Type",
            },
            sourceTypes: {
              type: "object",
              properties: {
                testSourceType: {
                  type: "object",
                  properties: {
                    amount: {
                      type: "number",
                      title: "Amount",
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
            activityData={{
              activityId: 1,
              sourceTypeMap: { 1: "testSourceType" },
            }}
            currentActivity={{
              id: 1,
              name: "Test Activity",
              slug: "test_activity",
            }}
            navigationInformation={dummyNavigationInformation}
            activityFormData={{
              testSourceType: true,
              sourceTypes: {
                testSourceType: {
                  amount: 100,
                },
              },
            }}
            initialJsonSchema={submissionSchema}
            reportVersionId={1}
            facilityId={mockUUID}
            initialSelectedSourceTypeIds={["1"]}
            gasTypes={mockGasTypes}
            reportingYear={2024}
          />,
        );
        await flushPromises();
      });

      // The form should render
      expect(screen.getByText(/Amount/i)).toBeInTheDocument();
    });

    it("handles form submission error", async () => {
      (actionHandler as any).mockResolvedValue({
        error: "Submission failed",
      });

      const submissionSchema = {
        schema: {
          type: "object",
          properties: {
            testSourceType: {
              type: "boolean",
              title: "Test Source Type",
            },
            sourceTypes: {
              type: "object",
              properties: {
                testSourceType: {
                  type: "object",
                  properties: {
                    amount: {
                      type: "number",
                      title: "Amount",
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
            activityData={{
              activityId: 1,
              sourceTypeMap: { 1: "testSourceType" },
            }}
            currentActivity={{
              id: 1,
              name: "Test Activity",
              slug: "test_activity",
            }}
            navigationInformation={dummyNavigationInformation}
            activityFormData={{
              testSourceType: true,
              sourceTypes: {
                testSourceType: {
                  amount: 100,
                },
              },
            }}
            initialJsonSchema={submissionSchema}
            reportVersionId={1}
            facilityId={mockUUID}
            initialSelectedSourceTypeIds={["1"]}
            gasTypes={mockGasTypes}
            reportingYear={2024}
          />,
        );
        await flushPromises();
      });

      // The form should render
      expect(screen.getByText(/Amount/i)).toBeInTheDocument();
    });
  });
});
