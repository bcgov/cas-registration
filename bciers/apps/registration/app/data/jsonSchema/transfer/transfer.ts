import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { FacilityRow } from "@/administration/app/components/facilities/types";
import { OperationRow } from "@/administration/app/components/operations/types";
import { OperatorRow } from "@/administration/app/components/operators/types";

export const createTransferSchema = (
  operatorOptions: OperatorRow[],
  operationOptions: OperationRow[] = [], // fromOperationOptions and operationOptions are the same
  toOperationOptions: OperationRow[] = [],
  facilityOptions: FacilityRow[] = [],
) => {
  const transferSchema: RJSFSchema = {
    type: "object",
    title: "Transfer Entity",
    required: ["from_operator", "to_operator", "transfer_entity"],
    properties: {
      // We don't need the sectioning here, but it's just to make the form look like the wireframes
      transfer_header: {
        //Not an actual field in the db - this is just to make the form look like the wireframes
        type: "object",
        readOnly: true,
        title: "Transfer Entity",
      },
      transfer_preface: {
        //Not an actual field in the db - this is just to make the form look like the wireframes
        type: "object",
        readOnly: true,
        title: "Select the operators involved",
      },
      from_operator: {
        type: "string",
        title: "Current Operator",
        anyOf: operatorOptions?.map((operator) => ({
          const: operator.id,
          title: operator.legal_name,
        })),
      },
      to_operator: {
        type: "string",
        title: "Select the new operator",
        anyOf: operatorOptions?.map((operator) => ({
          const: operator.id,
          title: operator.legal_name,
        })),
      },
      transfer_entity: {
        type: "string",
        title: "What is being transferred?",
        oneOf: [
          {
            const: "Operation",
            title: "Operation",
          },
          {
            const: "Facility",
            title: "Facility",
          },
        ],
      },
    },
    dependencies: {
      transfer_entity: {
        allOf: [
          {
            if: {
              properties: {
                transfer_entity: {
                  const: "Operation",
                },
              },
            },
            then: {
              properties: {
                operation: {
                  type: "string",
                  title: "Operation",
                },
                effective_date: {
                  type: "string",
                  title: "Effective date of transfer",
                },
              },
              required: ["operation", "effective_date"],
            },
          },
          {
            if: {
              properties: {
                transfer_entity: {
                  const: "Facility",
                },
              },
            },
            then: {
              properties: {
                from_operation: {
                  type: "string",
                  title:
                    "Select the operation that the facility(s) currently belongs to",
                },
                facilities: {
                  type: "array",
                  title: "Facilities",
                  items: {
                    type: "string",
                  },
                },
                to_operation: {
                  type: "string",
                  title:
                    "Select the new operation the facility(s) will be allocated to",
                },
                effective_date: {
                  type: "string",
                  title: "Effective date of transfer",
                },
              },
              required: [
                "from_operation",
                "facilities",
                "to_operation",
                "effective_date",
              ],
            },
          },
        ],
      },
    },
  };

  const transferSchemaCopy = JSON.parse(JSON.stringify(transferSchema));

  if (operationOptions.length > 0) {
    const operationOptionsAnyOf = operationOptions.map(
      (operation: OperationRow) => ({
        const: operation.operation__id,
        title: operation.operation__name,
      }),
    );
    // Add the operation options to the operation field
    transferSchemaCopy.dependencies.transfer_entity.allOf[0].then.properties.operation.anyOf =
      operationOptionsAnyOf;
    // Add the operation options to the from_operation field
    transferSchemaCopy.dependencies.transfer_entity.allOf[1].then.properties.from_operation.anyOf =
      operationOptionsAnyOf;
  }

  if (toOperationOptions.length > 0) {
    // Add the operation options to the to_operation field
    transferSchemaCopy.dependencies.transfer_entity.allOf[1].then.properties.to_operation.anyOf =
      toOperationOptions.map((operation: OperationRow) => ({
        const: operation.operation__id,
        title: operation.operation__name,
      }));
  }

  if (facilityOptions.length > 0) {
    // Add the facility options to the facilities field
    transferSchemaCopy.dependencies.transfer_entity.allOf[1].then.properties.facilities.items.enum =
      facilityOptions.map((facility) => facility.facility__id);
    transferSchemaCopy.dependencies.transfer_entity.allOf[1].then.properties.facilities.items.enumNames =
      facilityOptions.map(
        (facility) =>
          `${facility.facility__name} - (${facility.facility__latitude_of_largest_emissions}, ${facility.facility__longitude_of_largest_emissions})`,
      );
  }

  return transferSchemaCopy;
};

export const transferUISchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui:options": {
    label: false,
  },
  transfer_header: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "form-heading mb-8",
  },
  transfer_preface: {
    "ui:classNames": "text-bc-bg-blue text-md",
  },
  from_operator: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select the current operator",
  },
  to_operator: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select the new operator",
  },
  transfer_entity: {
    "ui:widget": "RadioWidget",
    "ui:classNames": "md:gap-20",
    "ui:options": {
      inline: true,
    },
  },
  operation: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select the operation",
  },
  effective_date: {
    "ui:widget": "DateWidget",
  },
  from_operation: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select the operation",
  },
  facilities: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select facilities",
  },
  to_operation: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select the operation",
  },
};
