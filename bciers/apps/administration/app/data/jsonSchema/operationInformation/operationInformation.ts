import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getNaicsCodes, getReportingActivities } from "@bciers/actions/api";
import { Apps, OperationTypes } from "@bciers/utils/src/enums";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

export const eioOperationInformationSchema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  required: ["name", "type"],
  properties: {
    name: { type: "string", title: "Operation Name" },
    type: {
      type: "string",
      title: "Operation Type",
      enum: [OperationTypes.EIO],
      default: OperationTypes.EIO,
    },
  },
};

export const createOperationInformationSchema = async (
  app: Apps,
  registrationPurpose: RegistrationPurposes | undefined,
): Promise<RJSFSchema> => {
  if (
    registrationPurpose === RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION
  ) {
    return eioOperationInformationSchema;
  }

  // SFOs and LFOs require more properties and a different type enum
  const naicsCodes = await getNaicsCodes();
  const reportingActivities = await getReportingActivities();
  const sfoAndLfoSchema = { ...eioOperationInformationSchema };

  sfoAndLfoSchema.required = [
    ...(sfoAndLfoSchema.required ?? []),
    "naics_code_id",
    "activities",
    "boundary_map",
    "process_flow_diagram",
  ];
  sfoAndLfoSchema.properties = {
    ...sfoAndLfoSchema.properties,
    type: {
      type: "string",
      title: "Operation Type",
      enum: [OperationTypes.SFO, OperationTypes.LFO],
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
      process_flow_diagram: {
        type: "string",
        title: "Process Flow Diagram",
        format: "data-url",
      },
      boundary_map: {
        type: "string",
        title: "Boundary Map",
        format: "data-url",
      },
      ...(app === Apps.ADMINISTRATION
        ? {
            bc_obps_regulated_operation: {
              type: "string",
              title: "BORO ID",
            },
          }
        : {}),
      ...(app === Apps.ADMINISTRATION
        ? {
            bcghg_id: {
              type: "string",
              title: "BCGHGID",
            },
          }
        : {}),
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
          (activity: { applicable_to: string; name: string }) => activity.name,
        ),
      },
      title: "Reporting Activities",
    },
    process_flow_diagram: {
      type: "string",
      title: "Process Flow Diagram",
      format: "data-url",
    },
    boundary_map: {
      type: "string",
      title: "Boundary Map",
      format: "data-url",
    },
    ...(app === Apps.ADMINISTRATION && {
      bc_obps_regulated_operation: {
        type: "string",
        title: "BORO ID",
      },
      bcghg_id: {
        type: "string",
        title: "BCGHGID",
      },
    }),
  };
  return sfoAndLfoSchema;
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
  process_flow_diagram: {
    "ui:widget": "FileWidget",
    "ui:options": {},
  },
  boundary_map: {
    "ui:widget": "FileWidget",
    "ui:options": {},
  },
  bc_obps_regulated_operation: {
    "ui:widget": "BoroIdWidget",
  },
  bcghg_id: {
    "ui:widget": "BcghgIdWidget",
  },
};
