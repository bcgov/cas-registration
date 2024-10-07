import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { SectionFieldTemplate } from "@bciers/components/form/fields";
import {
  meetsSection3EmissionsRequirementsText,
  meetsEntireOperationRequirementsText,
  meetsSection6EmissionsRequirementsText,
  meetsNaicsCode1122562ClassificationRequirementsText,
  meetsProducingGgerScheduleA1RegulatedProductText,
  meetsReportingAndRegulatedObligationsText,
  meetsNotificationToDirectorOnCriteriaChangeText,
} from "./optedInOperationText";

export const optedInOperationSchema: RJSFSchema = {
  title: "Opt-In Application",
  type: "object",
  required: [
    "meets_section_3_emissions_requirements",
    "meets_electricity_import_operation_criteria",
    "meets_entire_operation_requirements",
    "meets_section_6_emissions_requirements",
    "meets_naics_code_11_22_562_classification_requirements",
    "meets_producing_gger_schedule_a1_regulated_product",
    "meets_reporting_and_regulated_obligations",
    "meets_notification_to_director_on_criteria_change",
  ],
  properties: {
    opt_in_operation: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "string",
      readOnly: true,
    },
    opt_in_operation_preface: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "string",
      readOnly: true,
    },
    meets_section_3_emissions_requirements: {
      type: "boolean",
    },
    meets_electricity_import_operation_criteria: {
      type: "boolean",
    },
    meets_entire_operation_requirements: {
      type: "boolean",
    },
    meets_section_6_emissions_requirements: {
      type: "boolean",
    },
    meets_naics_code_11_22_562_classification_requirements: {
      type: "boolean",
    },
    meets_producing_gger_schedule_a1_regulated_product: {
      type: "boolean",
    },
    meets_reporting_and_regulated_obligations: {
      type: "boolean",
    },
    meets_notification_to_director_on_criteria_change: {
      type: "boolean",
    },
  },
};

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
