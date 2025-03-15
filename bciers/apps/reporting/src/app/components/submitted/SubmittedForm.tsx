"use client";
import { ReviewData } from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
import FinalReviewFormRenderer from "@reporting/src/app/components/finalReview/formCustomization/FinalReviewFormRenderer";

interface Props {
  data: ReviewData[];
}
const SubmittedForm: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col gap-4">
      {data.map((form, idx) => {
        if (form.items) {
          return (
            <details
              key={idx}
              className="border-2 border-t-0 border-b-0 border-[#38598A] p-2 my-2 w-full"
            >
              <summary className="cursor-pointer font-bold text-[#38598A] text-2xl py-2 border-2 border-t-0 border-b-0 border-[#38598A]">
                {form.schema.title}
              </summary>
              {form.items.map((item: any, index: number) =>
                FinalReviewFormRenderer({ idx: index, form: item, data }),
              )}
            </details>
          );
        }

        return FinalReviewFormRenderer({ idx, form, data });
      })}
    </div>
  );
};

export default SubmittedForm;
