import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Header from "@/administration/app/components/userOperators/UserOperatorsHeader";
import Page from "@/administration/app/components/userOperators/UserOperatorsPage";

export default function UserOperatorsPageFactory() {
  return defaultPageFactory(Page, {
    fallback: <Loading />,
    header: Header,
  });
}
