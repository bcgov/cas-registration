"use client";

import { useState } from "react";
import Accordion from "app/components/accordion/Accordion";
import FormBase from "./FormBase";

interface Props {
  schema: any;
  uiSchema: any;
  formData: any;
}

const MultiStepAccordion = ({ schema, uiSchema, formData }: Props) => {
  const [expandAll, setExpandAll] = useState(false);
  const accordionSectionList = Object.keys(schema.properties as any);

  if (accordionSectionList.length === 0) return null;

  const handleExpandAll = () => {
    setExpandAll(true);
  };

  const handleCollapseAll = () => {
    setExpandAll(false);
  };

  return (
    <section className="mb-8">
      <div className="w-full flex justify-end mb-4 mt-12">
        <div>
          <button
            className="button-link text-2xl pr-4"
            onClick={handleExpandAll}
          >
            Expand All
          </button>
          <button className="button-link text-2xl" onClick={handleCollapseAll}>
            Collapse All
          </button>
        </div>
      </div>
      {accordionSectionList.map((_section, index) => {
        return (
          <Accordion
            key={index}
            expanded={expandAll}
            title={schema.properties[accordionSectionList[index]].title}
          >
            <FormBase
              schema={schema.properties[accordionSectionList[index]]}
              uiSchema={uiSchema}
              formData={formData}
              disabled
              // Pass children as prop so RJSF doesn't render submit button
              // eslint-disable-next-line react/no-children-prop
              children
            />
          </Accordion>
        );
      })}
    </section>
  );
};

export default MultiStepAccordion;
