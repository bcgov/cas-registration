import { UiSchema } from "@rjsf/utils";
import { signOffUiSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";

export const createSignOffUiSchema = (
  isSupplementaryReport: boolean,
  isRegulatedOperation: boolean,
): UiSchema => {
  const uiSchema: UiSchema = { ...signOffUiSchema };
  if (isSupplementaryReport && isRegulatedOperation) {
    uiSchema.supplementary = {
      "ui:FieldTemplate": FieldTemplate,
      "ui:options": {
        style: {
          background: "#F2F2F2",
          label: "",
          marginBottom: "20px",
          padding: "16px",
        },
        label: false,
      },
      editing_note: {
        "ui:FieldTemplate": TitleOnlyFieldTemplate,
        "ui:classNames": "mt-2 mb-5",
      },
      acknowledgement_of_new_version: {
        "ui:FieldTemplate": BasicFieldTemplate,
        "ui:widget": "CheckboxWidget",
        "ui:options": {
          alignment: "top",
        },
      },
      acknowledgement_of_corrections: {
        "ui:FieldTemplate": BasicFieldTemplate,
        "ui:widget": "CheckboxWidget",
        "ui:options": {
          alignment: "top",
        },
      },
    };
  }

  return uiSchema;
};
