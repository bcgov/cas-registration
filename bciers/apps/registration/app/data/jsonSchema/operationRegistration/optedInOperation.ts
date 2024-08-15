import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import {
  optedInOperationPreface,
  hasEmissionsForSection3Text,
  isEntireOperationOptedInForDesignationText,
  hasEmissionsForSection6Text,
  primaryEconomicActivityText,
  producesRegulatedProductInGgerrText,
  isCapableOfFulfillingReportingAndRegulatedObligationsText,
  willNotifyDirectorIfCriteriaNotMetText,
} from "./optedInOperationText";

export const optedInOperationSchema: RJSFSchema = {
  title: "Opt-In Application",
  type: "object",
  required: [
    "has_emissions_for_section_3",
    "is_electricity_import_operation",
    "is_entire_operation_opted_in_for_designation",
    "has_emissions_for_section_6",
    "is_primary_economic_activity_classified_by_naics_11_22_562",
    "produces_regulated_product_in_ggerr",
    "is_capable_of_fulfilling_reporting_and_regulated_obligations",
    "will_notify_director_if_criteria_not_met",
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
    has_emissions_for_section_3: {
      type: "boolean",
    },
    is_electricity_import_operation: {
      type: "boolean",
    },
    is_entire_operation_opted_in_for_designation: {
      type: "boolean",
    },
    has_emissions_for_section_6: {
      type: "boolean",
    },
    is_primary_economic_activity_classified_by_naics_11_22_562: {
      type: "boolean",
    },
    produces_regulated_product_in_ggerr: {
      type: "boolean",
    },
    is_capable_of_fulfilling_reporting_and_regulated_obligations: {
      type: "boolean",
    },
    will_notify_director_if_criteria_not_met: {
      type: "boolean",
    },
  },
};

// Customizing the classNames for the RadioWidget label and choices to match the wireframes
const customClassNamesForRadioWidget =
  "[&>div:first-child]:w-[600px] md:[&>div:first-child]:mr-10 md:my-6 [&>div:nth-child(2)]:w-[200px]";

export const optedInOperationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  opt_in_operation: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "text-bc-bg-blue text-lg font-bold mt-2",
    "ui:title": "Opt-In Operation",
  },
  opt_in_operation_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": optedInOperationPreface,
  },
  has_emissions_for_section_3: {
    "ui:title": hasEmissionsForSection3Text,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  is_electricity_import_operation: {
    "ui:title": "Is this operation is an electricity import operation?",
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  is_entire_operation_opted_in_for_designation: {
    "ui:title": isEntireOperationOptedInForDesignationText,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  has_emissions_for_section_6: {
    "ui:title": hasEmissionsForSection6Text,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  is_primary_economic_activity_classified_by_naics_11_22_562: {
    "ui:title": primaryEconomicActivityText,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  produces_regulated_product_in_ggerr: {
    "ui:title": producesRegulatedProductInGgerrText,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  is_capable_of_fulfilling_reporting_and_regulated_obligations: {
    "ui:title": isCapableOfFulfillingReportingAndRegulatedObligationsText,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
  will_notify_director_if_criteria_not_met: {
    "ui:title": willNotifyDirectorIfCriteriaNotMetText,
    "ui:widget": "RadioWidget",
    "ui:classNames": customClassNamesForRadioWidget,
  },
};
