import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Header from "@/administration/app/components/userOperators/SelectOperatorHeader";
import Form from "apps/administration/app/components/userOperators/SelectOperatorForm";

export default defaultPageFactory(Form, {
  header: Header,
});
