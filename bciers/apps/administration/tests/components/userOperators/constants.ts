import { UserOperatorStatus } from "@bciers/utils/src/enums";

export const id = "685d581b-5698-411f-ae00-de1d97334a71";
export const operatorLegalName = "Operator 1";
export const operatorJSON = {
  street_address: "123 Main St",
  id: id,
  legal_name: operatorLegalName,
  trade_name: "Operator 1 Trade Name",
  cra_business_number: 123456789,
};

export const UserOperatorJSON = {
  id,
  status: UserOperatorStatus.PENDING,
  is_new: false,
  operatorId: id,
  operatorStatus: "Approved",
  operatorLegalName: operatorLegalName,
};
