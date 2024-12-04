import FinalReviewForm from "@reporting/src/app/components/finalReview/FinalReviewForm";

export default function Page({ params }: { params: { version_id: number } }) {
  return <FinalReviewForm version_id={params.version_id} />;
}
