"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import { scheduleCUrl } from "@reporting/src/app/utils/constants";

/**
 * One-time use field template for the Biogenic Emissions Split section
 * in the Pulp and Paper form. Renders a grey box with the Schedule C link
 * inline in the title.
 */
const BiogenicEmissionsSplitFieldTemplate = ({
  children,
  errors,
  description,
  classNames,
}: FieldTemplateProps) => {
  return (
    <div
      className={`min-w-full rounded-md p-2 ${classNames}`}
      style={{
        backgroundColor: "#f2f2f2",
        paddingLeft: "1rem",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div className="font-semibold mb-2">
        Enter the proportion of industrial process emissions that are biogenic
        (emissions from biomass listed in{" "}
        <a
          href={scheduleCUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Schedule C
        </a>
        ).
      </div>
      {description}
      {children}
      {errors}
    </div>
  );
};

export default BiogenicEmissionsSplitFieldTemplate;
