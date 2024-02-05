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
  const [expandAll, setExpandAll] = useState({ isExpandAll: false });
  const accordionSectionList = Object.keys(schema.properties as any);

  if (accordionSectionList.length === 0) return null;

  // spread previous state so it's saved in a new memory location to trigger a re-render
  // This was needed because the buttons wouldn't work correctly when the same value was passed
  // if a user opened a single accordion and then clicked "Collapse All"
  const handleExpandAll = () => {
    setExpandAll({ ...expandAll, isExpandAll: true });
  };

  const handleCollapseAll = () => {
    setExpandAll({ ...expandAll, isExpandAll: false });
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
            expandedOptions={expandAll}
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
