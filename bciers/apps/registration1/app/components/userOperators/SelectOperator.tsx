import { selectOperatorSchema } from "@/app/utils/jsonSchema/selectOperator";
import SelectOperatorForm from "./SelectOperatorForm";

export default async function SelectOperator() {
  return <SelectOperatorForm schema={selectOperatorSchema} />;
}
