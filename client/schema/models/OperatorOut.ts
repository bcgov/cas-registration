/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Schema for the Operator model
 */
export type OperatorOut = {
  id?: number;
  legal_name: string;
  trade_name: string;
  cra_business_number: string;
  bc_corporate_registry_number: string;
  business_structure: string;
  mailing_address: string;
  bceid: string;
  parent_operator?: number;
  relationship_with_parent_operator?: string;
  compliance_obligee: number;
  date_aso_became_responsible_for_operator: string;
  documents: Array<number>;
  contacts: Array<number>;
  operators: Array<string>;
};
