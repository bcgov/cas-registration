import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";

export const personResponsibleSchema: RJSFSchema = {
  type: "object",
  title: "Person responsible",
  properties: {
    tbd: {
      title: "TBD",
      readOnly: true,
    },
  },
};

export const personResponsibleUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  tbd: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "TBD",
  },
};
