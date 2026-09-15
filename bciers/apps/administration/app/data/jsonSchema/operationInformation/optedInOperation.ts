import { UiSchema } from "@rjsf/utils";
import { SectionFieldTemplate } from "@bciers/components/form/fields";
import {
  meetsSection3EmissionsRequirementsText,
  meetsEntireOperationRequirementsText,
  meetsSection6EmissionsRequirementsText,
  meetsNaicsCode1122562ClassificationRequirementsText,
  meetsProducingGgerScheduleA1RegulatedProductText,
  meetsReportingAndRegulatedObligationsText,
  meetsNotificationToDirectorOnCriteriaChangeText,
} from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperationText";

// A little bit of extra margin so the detail page is slightly easier to read
const customClassNamesForDetailsPage = "mb-2";

// Unlike the registration version, these questions put their JSX in `ui:options.labelOverride`
// rather than `ui:title`: here they sit inside the registration_purpose `oneOf`, where a JSX
// title makes every "required" message read "[object Object]" and RJSF drops the duplicates.

export const optedInOperationDetailsUiSchema: UiSchema = {
  opted_in_operation: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:options": {
      label: false,
    },
    meets_section_3_emissions_requirements: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": { labelOverride: meetsSection3EmissionsRequirementsText },
    },
    meets_electricity_import_operation_criteria: {
      "ui:title": "Is this operation an electricity import operation?",
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_entire_operation_requirements: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": { labelOverride: meetsEntireOperationRequirementsText },
    },
    meets_section_6_emissions_requirements: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": { labelOverride: meetsSection6EmissionsRequirementsText },
    },
    meets_naics_code_11_22_562_classification_requirements: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": {
        labelOverride: meetsNaicsCode1122562ClassificationRequirementsText,
      },
    },
    meets_producing_gger_schedule_a1_regulated_product: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": {
        labelOverride: meetsProducingGgerScheduleA1RegulatedProductText,
      },
    },
    meets_reporting_and_regulated_obligations: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": {
        labelOverride: meetsReportingAndRegulatedObligationsText,
      },
    },
    meets_notification_to_director_on_criteria_change: {
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
      "ui:options": {
        labelOverride: meetsNotificationToDirectorOnCriteriaChangeText,
      },
    },
  },
};
