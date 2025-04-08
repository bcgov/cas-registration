import { UiSchema } from "@rjsf/utils";
import {
  lfoUiSchema,
  sfoUiSchema,
} from "@reporting/src/data/jsonSchema/verification/verification";
import { OperationTypes } from "@bciers/utils/src/enums";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { infoNote } from "@reporting/src/data/jsonSchema/verification/supplementaryReportNote";

export const createVerificationUISchema = (
  schemaType: string,
  isSupplementaryReport: boolean,
): UiSchema => {
  const schema = schemaType === OperationTypes.SFO ? sfoUiSchema : lfoUiSchema;

  if (isSupplementaryReport) {
    schema.info_note = {
      "ui:FieldTemplate": TitleOnlyFieldTemplate,
      "ui:title": infoNote(),
    };
  }

  return schema;
};
