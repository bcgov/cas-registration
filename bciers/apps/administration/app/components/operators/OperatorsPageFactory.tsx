import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/operators/OperatorsHeader";
import Page from "@/administration/app/components/operators/OperatorsPage";

export default function OperatorsPageFactory() {
  return defaultPageFactory(Page, {
    fallback: <Loading />,
    header: Header,
  });
}
