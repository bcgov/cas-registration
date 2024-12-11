import OperatorForm from "./OperatorForm";
import getCurrentOperator from "./getCurrentOperator";

import getOperator from "./getOperator";
import { UUID } from "crypto";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { createOperatorSchema } from "../../data/jsonSchema/operator";
import { getBusinessStructures } from "@bciers/actions/api";

// 🧩 Main component
export default async function OperatorPage({
  isCreating = false,
  operatorId,
}: { isCreating?: boolean; operatorId?: UUID } = {}) {
  const role = await getSessionRole();

  let operatorFormData: { [key: string]: any } | { error: string } = {};

  if (!isCreating) {
    // operatorId is only passed in for internal users. External users only have access to their own operator
    if (operatorId && role.includes("cas_")) {
      operatorFormData = await getOperator(operatorId);
    } else {
      operatorFormData = await getCurrentOperator();
    }
    if (!operatorFormData || operatorFormData?.error) {
      throw new Error("Failed to retrieve operator information");
    }
  }
  const businessStructures: { name: string }[] | { error: string } =
    await getBusinessStructures();
  if ("error" in businessStructures) {
    throw new Error("Failed to retrieve business structure information");
  }

  return (
    <OperatorForm
      schema={await createOperatorSchema()}
      formData={operatorFormData}
      isCreating={isCreating}
      isInternalUser={role.includes("cas_")}
    />
  );
}
