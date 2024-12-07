"use client";

import { useState } from "react";
import Accordion from "@bciers/components/accordion/Accordion";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

interface Content {
  title: string;
  component: JSX.Element;
}

interface Props {
  // Optional prop to render a section before the form
  expandedSteps?: { [key: string]: boolean };
  content: Content[];
}

const ComponentAccordion = ({ expandedSteps, content }: Props) => {
  const [expandAll, setExpandAll] = useState({ isExpandAll: false });

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
      {content.map((component: Content, index: number) => {
        const isExpanded = expandedSteps ? true : false;

        return (
          <Accordion
            key={index}
            expanded={isExpanded}
            expandedOptions={expandAll}
            title={component.title}
          >
            {component.component}
          </Accordion>
        );
      })}
    </section>
  );
};

export default ComponentAccordion;
