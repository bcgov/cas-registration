import SelectOperatorForm from "@/app/components/form/SelectOperatorForm";
import { selectOperatorSchema } from "@/app/utils/jsonSchema/selectOperator";

export default async function SelectOperator() {
  return <SelectOperatorForm schema={selectOperatorSchema} />;
}
