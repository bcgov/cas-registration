import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import OperatorDetailsPage from "@/administration/app/components/operators/OperatorDetailsPage";
import type { UUID } from "crypto";

export default function OperatorDetailPageFactory() {
  return defaultPageFactory(OperatorDetailsPage, {
    mapParamsToPageProps: async ({ params }) => {
      const { operatorId } = await params;
      return { operatorId: operatorId as UUID };
    },
  });
}
