import { selectOperatorSchema } from "@bciers/utils/server";
import SelectOperatorForm from "./SelectOperatorForm";

export default async function SelectOperator() {
  return <SelectOperatorForm schema={selectOperatorSchema} />;
}
