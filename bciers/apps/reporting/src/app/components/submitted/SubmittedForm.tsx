"use client";
import { ReviewData } from "@reporting/src/app/components/finalReview/reviewDataFactory/factory";
import FinalReviewForms from "@reporting/src/app/components/finalReview/formCustomization/FinalReviewForms";
import { useRouter } from "next/navigation";
import { baseUrlReports } from "@reporting/src/app/utils/constants";
import { Button } from "@mui/material";

interface Props {
  data: ReviewData[];
}

const SubmittedForm: React.FC<Props> = ({ data }) => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 items-start">
      <FinalReviewForms data={data} />
      <Button
        variant="outlined"
        onClick={() => router.push(baseUrlReports)}
        sx={{ width: "auto" }}
      >
        Back
      </Button>
    </div>
  );
};

export default SubmittedForm;
