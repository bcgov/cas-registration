import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import getPreviousReportableOperations from "@reporting/src/app/utils/getPreviousReportableOperations";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";
import { infoNote } from "@reporting/src/data/jsonSchema/report/reportableOperationNote";

type ReportableOperation = {
  operation_id: string;
  operation_name: string;
  reporting_year: number;
  registration_purposes: RegistrationPurposes[];
};

interface CombinedRJSFSchemas {
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

export const createStartReportSchemas =
  async (): Promise<CombinedRJSFSchemas> => {
    const reportableOperations: ReportableOperation[] =
      await getPreviousReportableOperations();

    const reportingYears = Array.from(
      new Set(reportableOperations.map(({ reporting_year }) => reporting_year)),
    ).sort((a, b) => b - a);

    const operationHelpText =
      "Only operations missing a submitted report are shown. If an operation is not showing, it must be registered first.";

    const schema: RJSFSchema = {
      type: "object",
      title: "Report on a previous year",
      required: ["reporting_year", "operation_id", "registration_purpose"],
      properties: {
        reporting_year: {
          type: "number",
          title: "Select reporting year",
          anyOf: reportingYears.map((reportingYear) => ({
            const: reportingYear,
            title: String(reportingYear),
          })),
        },
        operation_id: {
          type: "string",
          title: "Select operation",
          description: operationHelpText,
        },
        registration_purpose: {
          type: "string",
          title:
            "Select the registration purpose that was applicable in the selected reporting year",
        },
      },
      dependencies: {
        reporting_year: {
          oneOf: reportingYears.map((reportingYear) => {
            const operationsForYear = reportableOperations.filter(
              (operation) => operation.reporting_year === reportingYear,
            );

            return {
              properties: {
                reporting_year: {
                  const: reportingYear,
                },
                operation_id: {
                  type: "string",
                  title: "Select operation",
                  description: operationHelpText,
                  anyOf: operationsForYear.map((operation) => ({
                    const: operation.operation_id,
                    title: operation.operation_name,
                  })),
                },
              },
              dependencies: {
                operation_id: {
                  oneOf: operationsForYear.map((operation) => ({
                    properties: {
                      operation_id: {
                        const: operation.operation_id,
                      },
                      registration_purpose: {
                        type: "string",
                        title:
                          "Select the registration purpose that was applicable in the selected reporting year",
                        anyOf: operation.registration_purposes.map(
                          (purpose: RegistrationPurposes) => ({
                            const: purpose,
                            title: purpose,
                          }),
                        ),
                      },
                    },
                  })),
                },
              },
            };
          }),
        },
      },
    };

    const uiSchema: UiSchema = {
      "ui:FieldTemplate": FieldTemplate,
      "ui:classNames": "form-heading-label",
      "ui:order": ["reporting_year", "operation_id", "registration_purpose"],
      reporting_year: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select reporting year",
      },
      operation_id: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select operation",
        "ui:description": infoNote,
      },
      registration_purpose: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select registration purpose",
      },
    };

    return {
      schema,
      uiSchema,
    };
  };
