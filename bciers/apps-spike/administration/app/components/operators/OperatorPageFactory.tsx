import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import OperatorPage from "@/administration/app/components/operators/OperatorPage";
import type { UUID } from "crypto";

type Options = {
  isCreating?: boolean;
};

export default function OperatorPageFactory(options?: Options) {
  return defaultPageFactory(OperatorPage, {
    pageProps: {
      isCreating: options?.isCreating ?? false,
    },
    mapParamsToPageProps: async ({ params }) => {
      const { operatorId } = await params;
      return { operatorId: operatorId as UUID };
    },
  });
}
