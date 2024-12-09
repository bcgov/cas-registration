"use client";

import { useState } from "react";
import Accordion from "@bciers/components/accordion/Accordion";

interface Content {
  title: string;
  component: JSX.Element;
}

interface Props {
  content: Content[];
}

const ComponentAccordion = ({ content }: Props) => {
  const [expandAll, setExpandAll] = useState({ isExpandAll: true });

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
        return (
          <Accordion
            key={index}
            expanded={true}
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
