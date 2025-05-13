import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import { ReviewDataFactoryItem } from "./factory";
import { createPersonResponsibleSchema } from "../../operations/personResponsible/createPersonResponsibleSchema";
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";

const personResponsibleFactoryItem: ReviewDataFactoryItem = async (
  versionId,
) => {
  const { sync_button: any, ...personResponsibleUiSchemaWithoutSyncButton } =
    personResponsibleUiSchema;

  // Deep copy to avoid long-lived module JSON mutation persistence
  const localFactoryPersonResponsibleSchema = JSON.parse(
    JSON.stringify(personResponsibleSchema),
  );

  localFactoryPersonResponsibleSchema.properties = {
    person_responsible: { type: "string", title: " " },
  };

  const contactData = await getReportingPersonResponsible(versionId);

  return [
    {
      schema: createPersonResponsibleSchema(
        localFactoryPersonResponsibleSchema,
        [],
        1,
        contactData,
      ),
      uiSchema: personResponsibleUiSchemaWithoutSyncButton,
      data: contactData,
    },
  ];
};

export default personResponsibleFactoryItem;
