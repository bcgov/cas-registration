import { RJSFSchema } from "@rjsf/utils";
import { signOffSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";

export const createSignOffSchema = (
  isSupplementaryReport: boolean,
  isRegulatedOperation: boolean,
): RJSFSchema => {
  const schema = signOffSchema;

  if (isSupplementaryReport && isRegulatedOperation) {
    schema.properties = schema.properties || {};
    delete schema.properties.acknowledgement_of_possible_costs;
    schema.properties.supplementary = {
      type: "object",
      properties: {
        editing_note: {
          title:
            "By editing the original submission, please confirm that you understand the following:",
          type: "string",
        },
        acknowledgement_of_new_version: {
          title:
            "I understand that, by submitting these changes, I am creating a new version of this annual report that will, effective immediately, be the annual report for the reporting and or compliance period that it pertains to.",
          type: "boolean",
          default: false,
        },
        acknowledgement_of_corrections: {
          title:
            "I understand that the correction of any errors, omissions, or misstatements in the new submission of this report may lead to an additional compliance obligation, and, if submitted after the compliance obligation deadline, applicable interest.",
          type: "boolean",
          default: false,
        },
      },
    };
  }
  return schema;
};
