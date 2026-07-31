import OperatorForm from "./OperatorForm";
import getCurrentOperator from "./getCurrentOperator";

import getOperator from "./getOperator";
import { UUID } from "crypto";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { createOperatorSchema } from "../../data/jsonSchema/operator";

// 🧩 Main component
export default async function OperatorPage({
  isCreating = false,
  operatorId,
}: {
  isCreating?: boolean;
  operatorId?: UUID;
}) {
  const role = await getSessionRole();
  const isInternalUser = role.includes("cas_");

  let operatorFormData: { [key: string]: any } | { error: string } = {};

  if (!isCreating) {
    // operatorId is only passed in for internal users. External users only have access to their own operator
    if (operatorId && role.includes("cas_")) {
      operatorFormData = await getOperator(operatorId);
    } else {
      operatorFormData = await getCurrentOperator();
    }
  }

  return (
    <OperatorForm
      schema={await createOperatorSchema()}
      formData={operatorFormData}
      isCreating={isCreating}
      isInternalUser={isInternalUser}
    />
  );
}
