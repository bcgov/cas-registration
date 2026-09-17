import { ValidationMessageKey as SharedKey } from "@bciers/components/validationErrors";

/**
 * Application specific validation message keys, combined wit shared system keys
 */
export type ValidationMessageKey = SharedKey<
  "no_bceid_access" | "operation_rep_required" | "operator_not_found"
>;
