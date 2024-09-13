import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getNaicsCodes, getReportingActivities } from "@bciers/actions/api";

export const createOperationInformationSchema =
  async (): Promise<RJSFSchema> => {
    const naicsCodes = await getNaicsCodes();
    const reportingActivities = await getReportingActivities();
    const operationInformationSchema: RJSFSchema = {
      title: "Operation Information",
      type: "object",
      required: [
        "name",
        "type",
        "naics_code_id",
        "activities",
        "boundary_map",
        "process_flow_diagram",
        "equipment_list",
      ],
      properties: {
        name: { type: "string", title: "Operation Name" },
        type: {
          type: "string",
          title: "Operation Type",
          enum: ["Single Facility Operation", "Linear Facility Operation"],
        },
        naics_code_id: {
          type: "number",
          title: "Primary NAICS Code",
          anyOf: naicsCodes.map(
            (code: {
              id: number;
              naics_code: string;
              naics_description: string;
            }) => ({
              const: code?.id,
              title: `${code?.naics_code} - ${code?.naics_description}`,
            }),
          ),
        },
        secondary_naics_code_id: {
          type: "number",
          title: "Secondary NAICS Code",
          anyOf: naicsCodes.map(
            (code: {
              id: number;
              naics_code: string;
              naics_description: string;
            }) => ({
              const: code?.id,
              title: `${code?.naics_code} - ${code?.naics_description}`,
            }),
          ),
        },
        tertiary_naics_code_id: {
          type: "number",
          title: "Tertiary NAICS Code",
          anyOf: naicsCodes.map(
            (code: {
              id: number;
              naics_code: string;
              naics_description: string;
            }) => ({
              const: code?.id,
              title: `${code?.naics_code} - ${code?.naics_description}`,
            }),
          ),
        },

        activities: {
          type: "array",
          minItems: 1,
          items: {
            type: "number",
            enum: reportingActivities.map(
              (activity: { id: number; applicable_to: string; name: string }) =>
                activity.id,
            ),
            // enumNames is a non-standard field required for the MultiSelectWidget
            // @ts-ignore
            enumNames: reportingActivities.map(
              (activity: { applicable_to: string; name: string }) =>
                activity.name,
            ),
          },
          title: "Reporting Activities",
        },
        process_flow_diagram: {
          type: "string",
          title: "Process Flow Diagram",
        },
        boundary_map: {
          type: "string",
          title: "Boundary Map",
        },
        equipment_list: {
          type: "string",
          title: "Equipment List",
        },
      },
    };
    return operationInformationSchema;
  };

export const operationInformationUISchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  type: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select Operation Type",
  },
  naics_code_id: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select Primary NAICS code",
  },
  secondary_naics_code_id: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select Secondary NAICS code",
  },
  tertiary_naics_code_id: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select Tertiary NAICS code",
  },
  activities: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Reporting Activity",
  },
  process_flow_diagram: {
    "ui:widget": "FileWidget",
  },
  boundary_map: {
    "ui:widget": "FileWidget",
  },
  equipment_list: {
    "ui:widget": "FileWidget",
  },
};
