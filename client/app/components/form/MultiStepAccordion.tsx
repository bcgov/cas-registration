"use client";

import Accordion from "app/components/accordion/Accordion";
import FormBase from "./FormBase";

interface Props {
  schema: any;
  uiSchema: any;
  formData: any;
}

const MultiStepAccordion = ({ schema, uiSchema, formData }: Props) => {
  const accordionSectionList = Object.keys(schema.properties as any);

  if (accordionSectionList.length === 0) return null;

  return (
    <>
      {accordionSectionList.map((_section, index) => {
        return (
          <Accordion
            key={index}
            title={schema.properties[accordionSectionList[index]].title}
          >
            <FormBase
              schema={schema.properties[accordionSectionList[index]]}
              uiSchema={uiSchema}
              formData={formData}
            />
          </Accordion>
        );
      })}
    </>
  );
};

export default MultiStepAccordion;
