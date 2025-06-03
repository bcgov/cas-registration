import { WidgetProps } from "@rjsf/utils";
import InternalDirectorReviewApprovalNote from "@/compliance/src/app/components/compliance-summary/request-issuance/internal-review-by-director/InternalDirectorReviewApprovalNote";
import InternalDirectorReviewChangesNote from "@/compliance/src/app/components/compliance-summary/request-issuance/internal-review-by-director/InternalDirectorReviewChangesNote";

interface DirectorReviewAlertWidgetProps extends WidgetProps {
  formContext?: {
    creditsIssuanceRequestData?: any;
  };
}

const DirectorReviewAlertWidget: React.FC<DirectorReviewAlertWidgetProps> = ({
  formContext,
}) => {
  const analystRecommendation =
    formContext?.creditsIssuanceRequestData?.analyst_recommendation;
  if (analystRecommendation === "ready_to_approve") {
    return <InternalDirectorReviewApprovalNote />;
  } else if (analystRecommendation === "require_changes") {
    return <InternalDirectorReviewChangesNote />;
  }

  return null;
};

export default DirectorReviewAlertWidget;
