"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import { Button } from "@mui/material";
import SubmitButton from "@bciers/components/button/SubmitButton";
import { useRouter } from "next/navigation";
import { IChangeEvent } from "@rjsf/core";
import { TransferFormData } from "@/registration/app/components/transfers/types";
import { OperatorRow } from "@/administration/app/components/operators/types";
import { createTransferSchemas } from "@/registration/app/data/jsonSchema/transfer/transfer";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import { FacilityRow } from "@/administration/app/components/facilities/types";
import TaskList from "@bciers/components/form/components/TaskList";
import { actionHandler } from "@bciers/actions";
import TransferSuccess from "@/registration/app/components/transfers/TransferSuccess";
import { OperationRow } from "@/administration/app/components/operations/types";
import { fetchOperationsPageData } from "@bciers/actions/api";
import useKey from "@bciers/utils/src/useKey";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";
import { UiSchema } from "@rjsf/utils";

interface TransferFormProps {
  formData: TransferFormData;
  operators: OperatorRow[];
}

interface FetchResult<TRow> {
  rows: TRow[];
  error?: string;
}

export default function TransferForm({
  formData,
  operators,
}: Readonly<TransferFormProps>) {
  const { transferSchema, transferUISchema } = createTransferSchemas(operators);
  const router = useRouter();

  const [formState, setFormState] = useState(formData);
  const [key, resetKey] = useKey();
  const { setErrors, renderedErrors } = useValidationErrors();
  const [schema, setSchema] = useState(transferSchema);
  const [uiSchema, setUiSchema] = useState(transferUISchema);
  const [fromOperatorOperations, setFromOperatorOperations] = useState<
    OperationRow[]
  >([]);
  const [toOperatorOperations, setToOperatorOperations] = useState<
    OperationRow[]
  >([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the form is valid
  const formIsValid = (data: TransferFormData): boolean => {
    let requiredFields = [
      "from_operator",
      "to_operator",
      "transfer_entity",
      "effective_date",
    ];
    if (data?.transfer_entity === "Operation")
      requiredFields = requiredFields.concat(["operation"]);
    if (data?.transfer_entity === "Facility") {
      requiredFields = requiredFields.concat([
        "from_operation",
        "facilities", // array of facilities
        "to_operation",
      ]);
    }
    return requiredFields.every((field) => {
      if (field === "facilities") return !!data[field]?.length;
      return !!data[field];
    });
  };

  // Derived rather than stored: the async handlers below rewrite formState after their fetches
  // resolve, and a stored flag would keep whatever the last onChange computed, leaving the
  // button's state disagreeing with the data it is validating.
  const disabled = !formIsValid(formState);
  // Handling the error when the same operator is selected for both from and to operators when transferring an operation
  const withSameOperatorError = (base: UiSchema): UiSchema => ({
    ...base,
    operation: {
      ...base?.operation,
      "ui:options": {
        ...(base?.operation?.["ui:options"] ?? {}),
        disabled: true,
      },
      "ui:help": (
        <small className="text-bc-error-red">
          <b>Note: </b>Cannot transfer an operation to the same operator
        </small>
      ),
    },
  });

  // uses functional update so it never closes over stale uiSchema
  const updateUiSchemaWithError = (): void =>
    setUiSchema((prev) => withSameOperatorError(prev));

  const resetUiSchema = () => setUiSchema(transferUISchema);

  // Changing an operator or the transfer entity invalidates the operation and facility
  // selections; changing the source operation invalidates the chosen facilities. Both are
  // synchronous consequences of the user's edit, so they are applied with the edit itself
  const clearInvalidatedSelections = (
    prev: TransferFormData,
    next: TransferFormData,
  ): TransferFormData => {
    if (
      next.from_operator !== prev.from_operator ||
      next.to_operator !== prev.to_operator ||
      next.transfer_entity !== prev.transfer_entity
    ) {
      return {
        ...next,
        operation: "",
        from_operation: "",
        to_operation: "",
        facilities: [],
      };
    }
    if (next.from_operation !== prev.from_operation) {
      return { ...next, facilities: [] };
    }
    return next;
  };

  // ✅ check against the *incoming* data, not stale formState
  const sameOperatorSelectedForOperationEntity = (
    d: TransferFormData,
  ): boolean =>
    !!d?.from_operator &&
    !!d?.to_operator &&
    d.from_operator === d.to_operator &&
    d.transfer_entity === "Operation";

  const fetchOperatorOperations = async (
    operatorId?: string,
  ): Promise<FetchResult<OperationRow>> => {
    if (!operatorId) return { rows: [] };

    const response: { rows: OperationRow[]; row_count: number } =
      await fetchOperationsPageData({
        paginate_result: false,
        operator_id: operatorId,
        sort_field: "operation__name",
        sort_order: "asc",
        end_date: true, // this indicates that the end_date is not null,
        status: "Active", // only fetch active facilities
      });

    return { rows: response.rows, error: undefined as any };
  };

  const handleOperatorChange = async (transferFormData: TransferFormData) => {
    // Reset error state
    setErrors(undefined);

    // Handle the error when the same operator is selected for both from and to operators when transferring an operation
    if (sameOperatorSelectedForOperationEntity(transferFormData))
      updateUiSchemaWithError();
    else resetUiSchema();

    const fromRes = await fetchOperatorOperations(
      transferFormData?.from_operator,
    );
    if (!handleApiResponse(fromRes, setErrors)) {
      return;
    }

    const toRes = await fetchOperatorOperations(transferFormData?.to_operator);
    if (!handleApiResponse(toRes, setErrors)) {
      return;
    }

    setFromOperatorOperations(fromRes.rows);
    setToOperatorOperations(toRes.rows);
    const updatedSchemaObjects = createTransferSchemas(
      operators,
      fromRes.rows,
      toRes.rows,
    );
    setSchema(updatedSchemaObjects.transferSchema);
    // Re-apply the same-operator error, otherwise the rebuilt uiSchema drops the message that
    // was set before the fetches started.
    setUiSchema(
      sameOperatorSelectedForOperationEntity(transferFormData)
        ? withSameOperatorError(updatedSchemaObjects.transferUISchema)
        : updatedSchemaObjects.transferUISchema,
    );
  };

  const fetchFacilities = async (
    operationId?: string,
  ): Promise<FetchResult<FacilityRow>> => {
    if (!operationId) return { rows: [] };

    const response: { rows: FacilityRow[]; row_count: number } =
      await fetchFacilitiesPageData(operationId, {
        paginate_result: false,
        end_date: true,
        status: "Active",
      });

    if (!response || "error" in response || !response.rows) {
      return { rows: [], error: "Failed to fetch facilities data!" };
    }

    return { rows: response.rows };
  };

  const handleFromOperationChange = async (
    transferFormData: TransferFormData,
  ) => {
    setErrors(undefined);

    const facilitiesRes = await fetchFacilities(
      transferFormData?.from_operation,
    );
    if (!handleApiResponse(facilitiesRes, setErrors)) {
      return;
    }

    const filteredToOperatorOperations = toOperatorOperations.filter(
      (operation: OperationRow) =>
        operation.operation__id !== transferFormData?.from_operation,
    );
    const updatedSchemaObjects = createTransferSchemas(
      operators,
      fromOperatorOperations,
      filteredToOperatorOperations,
      facilitiesRes.rows,
    );
    setSchema(updatedSchemaObjects.transferSchema);
    setUiSchema(updatedSchemaObjects.transferUISchema);

    // force re-render
    resetKey();
  };

  const handleFormStateUpdate = async (newFormState: TransferFormData) => {
    if (newFormState?.from_operation !== formState?.from_operation) {
      await handleFromOperationChange(newFormState);
    }

    if (
      newFormState?.from_operator != formState?.from_operator ||
      newFormState?.to_operator != formState?.to_operator ||
      newFormState?.transfer_entity != formState?.transfer_entity
    ) {
      await handleOperatorChange(newFormState);
    }
  };

  const submitHandler = async (e: IChangeEvent) => {
    setErrors(undefined);
    const updatedFormData = e.formData as TransferFormData;
    // we can't transfer facilities to the same operation
    if (
      updatedFormData.transfer_entity === "Facility" &&
      updatedFormData.from_operation === updatedFormData.to_operation
    ) {
      handleApiResponse(
        { error: "Cannot transfer facilities to the same operation!" },
        setErrors,
      );
      return;
    }

    setIsSubmitting(true);

    // ✅ keep local state aligned with what was submitted
    setFormState(updatedFormData);
    await handleFormStateUpdate(updatedFormData);

    const response = await actionHandler(
      "registration/transfer-events",
      "POST",
      "/transfers",
      {
        body: JSON.stringify(updatedFormData),
      },
    );

    setIsSubmitting(false);

    if (!handleApiResponse(response, setErrors)) {
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <>
      {isSubmitted ? (
        <TransferSuccess
          fromOperatorId={formState.from_operator}
          toOperatorId={formState.to_operator}
          operators={operators}
          effectiveDate={formState.effective_date}
          transferEntity={formState.transfer_entity}
        />
      ) : (
        <div className="w-full flex flex-row mt-8">
          <TaskList
            // Hide the task list on mobile
            className="hidden sm:block"
            // hardcoding the task list items because we are not using the SingleStepTaskListForm
            taskListItems={[{ section: "section", title: "Transfer Details" }]}
          />
          <div className="w-full">
            <FormBase
              key={key}
              schema={schema}
              uiSchema={uiSchema}
              formData={formState}
              onChange={(e: IChangeEvent) => {
                const updatedFormData = e.formData as TransferFormData;

                // ✅ keep state in sync immediately (prevents stale checks/UI)
                setFormState(
                  clearInvalidatedSelections(formState, updatedFormData),
                );

                handleFormStateUpdate(updatedFormData);
              }}
              onSubmit={submitHandler}
              omitExtraData={true}
            >
              <div className="min-h-6">{renderedErrors}</div>
              <div className="flex justify-between mt-8">
                <Button
                  className="ml-4"
                  variant="outlined"
                  type="button"
                  onClick={() => router.push("/transfers")}
                >
                  Back
                </Button>
                <SubmitButton disabled={disabled} isSubmitting={isSubmitting}>
                  Transfer Entity
                </SubmitButton>
              </div>
            </FormBase>
          </div>
        </div>
      )}
    </>
  );
}
