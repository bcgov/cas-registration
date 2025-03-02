import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { gscTemplate, sourceTypeCheckboxUiSchema } from "./common";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  gscWithProductionOfUsefulEnergy: sourceTypeCheckboxUiSchema,
  gscWithoutProductionOfUsefulEnergy: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    gscWithProductionOfUsefulEnergy: gscTemplate,
    gscWithoutProductionOfUsefulEnergy: gscTemplate,
  },
};

export default uiSchema;
