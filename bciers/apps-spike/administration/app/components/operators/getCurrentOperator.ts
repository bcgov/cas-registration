import { actionHandler } from "@bciers/actions";

async function getCurrentOperator() {
  return actionHandler(
    `registration/user-operators/current/operator`,
    "GET",
    ``,
  );
}

export default getCurrentOperator;
