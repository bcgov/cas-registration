import { actionHandler } from "@bciers/actions";

async function getCurrentOperator() {
  return actionHandler(
    `registration/v2/user-operators/current/operator`,
    "GET",
    ``,
  );
}

export default getCurrentOperator;
