import { render, screen, act, waitFor} from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import ActivityForm from "@reporting/src/app/components/activities/ActivityForm";
import { actionHandler } from "@bciers/testConfig/mocks";

// Mock data
const mockActivityData = {
  activityId: 1,
  sourceTypeMap: {
    1: 'firstTestSourceType',
    2: 'secondTestSourceType'
  }
};

const mockReportDate = '2024-01-01';

const mockUiSchema = {
  "ui:classNames": "form-heading-label",
  firstTestSourceType: {
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      label: false
    }
  },
  secondTestSourceType: {
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      label: false
    }
  }
};

const mockdefaultSourceType = {units: [{ fuels: [{ emissions: [{}] }] }]};

const response = {
  schema: {
    type: "object",
    title: "General stationary combustion",
    properties: {
      firstTestSourceType: {
        type: "boolean",
        title: "First Test Source Type Title"
      },
      secondTestSourceType: {
        type: "boolean",
        title: "Second Title"
      },
    }
  }
}


const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe("ActivityForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the activity schema", async () => {
    actionHandler.mockReturnValueOnce(JSON.stringify(response));
    render(
      <ActivityForm activityData={mockActivityData} reportDate={mockReportDate} uiSchema={mockUiSchema} defaultEmptySourceTypeState={mockdefaultSourceType} />
    )
    await flushPromises();
    screen.debug();
    screen.logTestingPlaygroundURL();

    // Check if the activity name is rendered
    expect(
      screen.getAllByText(/General stationary combustion/i).length,
    ).toBe(1);

    // Check if the source type booleans are rendered
    expect(
      screen.getAllByText(/First Test Source Type Title/i).length,
    ).toBe(1);
    expect(
      screen.getAllByText(/Second Title/i).length,
    ).toBe(1);
  });
  it("renders the sourceType schema", async () => {
    const response = {
      schema: {
        type: "object",
        title: "General stationary combustion",
        properties: {
          firstTestSourceType: {
            type: "boolean",
            title: "First Test Source Type Title"
          },
          secondTestSourceType: {
            type: "boolean",
            title: "Second Title"
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
                      title: "test field"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    actionHandler.mockReturnValueOnce(JSON.stringify(response));
    render(
      <ActivityForm activityData={mockActivityData} reportDate={mockReportDate} uiSchema={mockUiSchema} defaultEmptySourceTypeState={mockdefaultSourceType} />
    )
    await flushPromises();
    screen.debug();

    // Check if the units array within the source type schema is rendered
    expect(
      screen.getAllByText(/Unit/i).length,
    ).toBe(1);
  });

  // Will need additional tests once we're passing formData into this component & saving formData out of it
});
