"use client";
import React from "react";
import FinalReviewFormRenderer from "./FinalReviewFormRenderer";
import { ReviewData } from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";

interface Props {
  data: ReviewData[];
}

const FinalReviewForms: React.FC<Props> = ({ data }) => {
  return (
    <>
      {data.map((form, idx) => {
        // Provide a fallback title if none is defined.
        const title = form.schema?.title || `Form ${idx + 1}`;
        if (form.items) {
          return (
            <details
              key={title}
              className="border-2 border-t-0 border-b-0 border-[#38598A] p-2 my-2 w-full"
            >
              <summary className="cursor-pointer font-bold text-[#38598A] text-2xl py-2 border-2 border-t-0 border-b-0 border-[#38598A]">
                {title}
              </summary>
              {form.items.map((item: any, index: number) => (
                <div key={index}>
                  {FinalReviewFormRenderer({ idx: index, form: item, data })}
                </div>
              ))}
            </details>
          );
        }
        return FinalReviewFormRenderer({ idx, form, data });
      })}
    </>
  );
};

export default FinalReviewForms;
