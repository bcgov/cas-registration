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

export const optedInOperationDetailsUiSchema: UiSchema = {
  opted_in_operation: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:options": {
      label: false,
    },
    meets_section_3_emissions_requirements: {
      "ui:title": meetsSection3EmissionsRequirementsText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_electricity_import_operation_criteria: {
      "ui:title": "Is this operation an electricity import operation?",
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_entire_operation_requirements: {
      "ui:title": meetsEntireOperationRequirementsText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_section_6_emissions_requirements: {
      "ui:title": meetsSection6EmissionsRequirementsText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_naics_code_11_22_562_classification_requirements: {
      "ui:title": meetsNaicsCode1122562ClassificationRequirementsText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_producing_gger_schedule_a1_regulated_product: {
      "ui:title": meetsProducingGgerScheduleA1RegulatedProductText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_reporting_and_regulated_obligations: {
      "ui:title": meetsReportingAndRegulatedObligationsText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
    meets_notification_to_director_on_criteria_change: {
      "ui:title": meetsNotificationToDirectorOnCriteriaChangeText,
      "ui:widget": "RadioWidget",
      "ui:classNames": customClassNamesForDetailsPage,
    },
  },
};
