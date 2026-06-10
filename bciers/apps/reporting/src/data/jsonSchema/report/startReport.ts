import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  getReportingYears,
  getCurrentUsersOperations,
} from "@bciers/actions/api";

type ReportingYear = {
  reporting_year: number;
};

type ReportingOperation = {
  id: string;
  name: string;
  reporting_year: number;
};

interface CombinedRJSFSchemas {
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

export const createStartReportSchemas =
  async (): Promise<CombinedRJSFSchemas> => {
    const [reportingYears, operations]: [
      ReportingYear[],
      ReportingOperation[],
    ] = await Promise.all([
      getReportingYears("past"),
      getCurrentUsersOperations(),
    ]);

    const schema: RJSFSchema = {
      type: "object",
      title: "Start a Report",

      required: ["reporting_year", "reporting_operation"],

      properties: {
        reporting_year: {
          type: "number",
          title: "Reporting Year",
          anyOf: reportingYears.map((year) => ({
            const: year.reporting_year,
            title: String(year.reporting_year),
          })),
        },

        reporting_operation: {
          type: "string",
          title: "Reporting Operation",
        },
      },

      dependencies: {
        reporting_year: {
          oneOf: reportingYears.map((year) => ({
            properties: {
              reporting_year: {
                const: year.reporting_year,
              },

              reporting_operation: {
                type: "string",
                title: "Reporting Operation",
                anyOf: operations
                  .filter(
                    (operation) =>
                      operation.reporting_year === year.reporting_year,
                  )
                  .map((operation) => ({
                    const: operation.id,
                    title: operation.name,
                  })),
              },
            },
          })),
        },
      },
    };

    const uiSchema: UiSchema = {
      "ui:FieldTemplate": FieldTemplate,
      "ui:classNames": "form-heading-label",

      reporting_year: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select Reporting Year",
      },

      reporting_operation: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select Reporting Operation",
      },
    };

    return {
      schema,
      uiSchema,
    };
  };
