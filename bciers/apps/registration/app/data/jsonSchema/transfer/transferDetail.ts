import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { FacilityRow } from "@/administration/app/components/facilities/types";
import { OperationRow } from "@/administration/app/components/operations/types";
import { fetchOperationsPageData } from "@bciers/actions/api";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import { ExistingFacilities } from "@/registration/app/components/transfers/types";

const sharedSchemaProperties: RJSFSchema = {
  properties: {
    //Not an actual field in the db - this is just to make the form look like the wireframes
    transfer_header: {
      type: "object",
      readOnly: true,
      title: "Transfer Entity",
    },
    from_operator: {
      type: "string",
      readOnly: true,
      title: "Current Operator",
    },
    to_operator: {
      type: "string",
      readOnly: true,
      title: "New operator",
    },
    transfer_entity: {
      type: "string",
      readOnly: true,
      title: "What is being transferred?",
      oneOf: [
        { const: "Operation", title: "Operation" },
        { const: "Facility", title: "Facility" },
      ],
    },
    effective_date: {
      type: "string",
      title: "Effective date of transfer",
    },
  },
};

export const operationEntitySchema = async (
  existingOperationId: string,
  existingOperationName: string,
  fromOperatorId?: string,
): Promise<RJSFSchema> => {
  // Fetch the operations data based on the operator id
  const operationsByOperator = await fetchOperationsPageData({
    paginate_results: false,
    operator_id: fromOperatorId,
    end_date: true, // this indicates that the end_date is not null,
    status: "Active", // only fetch active facilities
  });
  if (
    !operationsByOperator ||
    "error" in operationsByOperator ||
    !operationsByOperator.rows
  )
    throw new Error("Failed to fetch operations data!" as any);

  /*
    Add the existing operation to the operation options
    For transferred operations, this option is no longer available from operationsByOperator, so we add it manually
  */
  const operationOptions = [
    {
      const: existingOperationId,
      title: existingOperationName,
    },
    ...operationsByOperator.rows
      .filter(
        ({ operation__id }: OperationRow) =>
          operation__id !== existingOperationId,
      )
      .map(({ operation__id, operation__name }: OperationRow) => ({
        const: operation__id,
        title: operation__name,
      })),
  ].sort((a: any, b: any) => a.title.localeCompare(b.title)); // Sort the operations alphabetically

  return {
    type: "object",
    properties: {
      section: {
        type: "object",
        title: "Transfer Details",
        required: ["operation", "effective_date"],
        properties: {
          ...sharedSchemaProperties.properties,
          operation: {
            type: "string",
            title: "Operation",
            anyOf: operationOptions,
          },
        },
      },
    },
  };
};

export const facilityEntitySchema = async (
  existingFacilities: ExistingFacilities[],
  fromOperationId: string,
): Promise<RJSFSchema> => {
  const facilitiesByOperation = await fetchFacilitiesPageData(fromOperationId, {
    paginate_results: false,
    end_date: true, // this indicates that the end_date is not null,
    status: "Active", // only fetch active facilities
  });
  if (
    !facilitiesByOperation ||
    "error" in facilitiesByOperation ||
    !facilitiesByOperation.rows
  )
    throw new Error("Failed to fetch facilities data!" as any);

  /*
    Add the existing facilities to the facility options
    For transferred facilities, this option is no longer available from facilitiesByOperation, so we add it manually
  */
  // Extract existing facility IDs and names
  const existingFacilityIds = existingFacilities.map((facility) => facility.id);
  const existingFacilityNames = existingFacilities.map(
    (facility) => facility.name,
  );

  // Initialize facility enum with existing facilities
  let facilityEnum = {
    enum: existingFacilityIds,
    enumNames: existingFacilityNames,
  };

  // Filter and append new facilities from the fetched data
  const newFacilities = facilitiesByOperation.rows.filter(
    (facility: FacilityRow) =>
      !existingFacilityIds.includes(facility.facility__id),
  );
  if (newFacilities.length > 0) {
    facilityEnum = {
      enum: facilityEnum.enum.concat(
        newFacilities.map((facility: FacilityRow) => facility.facility__id),
      ),
      enumNames: facilityEnum.enumNames.concat(
        newFacilities.map((facility: FacilityRow) => {
          const {
            facility__name: facilityName,
            facility__latitude_of_largest_emissions: facilityLatitude,
            facility__longitude_of_largest_emissions: facilityLongitude,
          } = facility;
          return facilityLatitude && facilityLongitude
            ? `${facilityName} - (${facilityLatitude}, ${facilityLongitude})`
            : facilityName;
        }),
      ),
    };
  }

  return {
    type: "object",
    properties: {
      section: {
        type: "object",
        title: "Transfer Details",
        required: ["facilities", "effective_date"],
        properties: {
          ...sharedSchemaProperties.properties,
          from_operation: {
            type: "string",
            title: "Current operation",
          },
          facilities: {
            type: "array",
            title: "Facilities",
            minItems: 1,
            items: {
              type: "string",
              ...facilityEnum,
            },
          },
          to_operation: {
            type: "string",
            title: "New operation",
          },
        },
      },
    },
  };
};

export const editTransferUISchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  section: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:options": {
      label: false,
    },
    "ui:order": [
      "transfer_header",
      "from_operator",
      "to_operator",
      "transfer_entity",
      "operation",
      "from_operation",
      "facilities",
      "to_operation",
      "effective_date",
    ],
    transfer_header: {
      "ui:FieldTemplate": FieldTemplate,
      "ui:classNames": "form-heading mb-8",
    },
    from_operator: {
      "ui:widget": "ReadOnlyWidget",
    },
    to_operator: {
      "ui:widget": "ReadOnlyWidget",
    },
    transfer_entity: {
      "ui:widget": "ReadOnlyRadioWidget",
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
      "ui:widget": "ReadOnlyWidget",
    },
    facilities: {
      "ui:widget": "MultiSelectWidget",
      "ui:placeholder": "Select facilities",
    },
    to_operation: {
      "ui:widget": "ReadOnlyWidget",
    },
  },
};
