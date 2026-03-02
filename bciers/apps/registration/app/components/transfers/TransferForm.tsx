"use client";

import { useState } from "react";
import FormBase from "@bciers/components/form/FormBase";
import { Alert, Button } from "@mui/material";
import SubmitButton from "@bciers/components/button/SubmitButton";
import { useRouter } from "next/navigation";
import { IChangeEvent } from "@rjsf/core";
import { TransferFormData } from "@/registration/app/components/transfers/types";
import { OperatorRow } from "@/administration/app/components/operators/types";
import {
  createTransferSchema,
  transferUISchema,
} from "@/registration/app/data/jsonSchema/transfer/transfer";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import { FacilityRow } from "@/administration/app/components/facilities/types";
import TaskList from "@bciers/components/form/components/TaskList";
import { actionHandler } from "@bciers/actions";
import TransferSuccess from "@/registration/app/components/transfers/TransferSuccess";
import { OperationRow } from "@/administration/app/components/operations/types";
import { fetchOperationsPageData } from "@bciers/actions/api";
import useKey from "@bciers/utils/src/useKey";

interface TransferFormProps {
  formData: TransferFormData;
  operators: OperatorRow[];
}

export default function TransferForm({
  formData,
  operators,
}: Readonly<TransferFormProps>) {
  const router = useRouter();

  const [formState, setFormState] = useState(formData);
  const [key, resetKey] = useKey();
  const [error, setError] = useState(undefined);
  const [schema, setSchema] = useState(createTransferSchema(operators));
  const [uiSchema, setUiSchema] = useState(transferUISchema);
  const [fromOperatorOperations, setFromOperatorOperations] = useState(
    [] as any,
  );
  const [toOperatorOperations, setToOperatorOperations] = useState([] as any);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(true);

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
  // Handling the error when the same operator is selected for both from and to operators when transferring an operation
  // uses functional update so it never closes over stale uiSchema
  const updateUiSchemaWithError = (): void =>
    setUiSchema((prev: any) => ({
      ...prev,
      operation: {
        ...prev.operation,
        "ui:options": {
          ...(prev.operation?.["ui:options"] ?? {}),
          disabled: true,
        },
        "ui:help": (
          <small className="text-bc-error-red">
            <b>Note: </b>Cannot transfer an operation to the same operator
          </small>
        ),
      },
    }));

  const resetUiSchema = () => setUiSchema(transferUISchema);

  // ✅ check against the *incoming* data, not stale formState
  const sameOperatorSelectedForOperationEntity = (
    d: TransferFormData,
  ): boolean =>
    !!d?.from_operator &&
    !!d?.to_operator &&
    d.from_operator === d.to_operator &&
    d.transfer_entity === "Operation";

  const fetchOperatorOperations = async (operatorId?: string) => {
    if (!operatorId)
      return { rows: [] as OperationRow[], error: undefined as any };

    const response: { rows: OperationRow[]; row_count: number } =
      await fetchOperationsPageData({
        paginate_results: false,
        operator_id: operatorId,
        sort_field: "operation__name",
        sort_order: "asc",
        end_date: true, // this indicates that the end_date is not null,
        status: "Active", // only fetch active facilities
      });

    if (!response || "error" in response || !response.rows) {
      return { rows: [], error: "Failed to fetch operations data!" as any };
    }

    return { rows: response.rows, error: undefined as any };
  };

  const handleOperatorChange = async (transferFormData: TransferFormData) => {
    // Reset error state
    setError(undefined);

    // Handle the error when the same operator is selected for both from and to operators when transferring an operation
    if (sameOperatorSelectedForOperationEntity(transferFormData))
      updateUiSchemaWithError();
    else resetUiSchema();

    const fromRes = await fetchOperatorOperations(
      transferFormData?.from_operator,
    );
    if (fromRes.error) {
      setError(fromRes.error);
      return;
    }

    const toRes = await fetchOperatorOperations(transferFormData?.to_operator);
    if (toRes.error) {
      setError(toRes.error);
      return;
    }

    setFromOperatorOperations(fromRes.rows);
    setToOperatorOperations(toRes.rows);
    setSchema(createTransferSchema(operators, fromRes.rows, toRes.rows));

    // reset dependent selections
    setFormState({
      ...transferFormData,
      operation: "",
      from_operation: "",
      to_operation: "",
      facilities: [],
    });
  };

  const fetchFacilities = async (operationId?: string) => {
    if (!operationId)
      return { rows: [] as FacilityRow[], error: undefined as any };

    const response: { rows: FacilityRow[]; row_count: number } =
      await fetchFacilitiesPageData(operationId, {
        paginate_results: false,
        end_date: true,
        status: "Active",
      });

    if (!response || "error" in response || !response.rows) {
      return { rows: [], error: "Failed to fetch facilities data!" as any };
    }

    return { rows: response.rows, error: undefined as any };
  };

  const handleFromOperationChange = async (
    transferFormData: TransferFormData,
  ) => {
    setError(undefined);

    const facilitiesRes = await fetchFacilities(
      transferFormData?.from_operation,
    );
    if (facilitiesRes.error) {
      setError(facilitiesRes.error);
      return;
    }

    const filteredToOperatorOperations = toOperatorOperations.filter(
      (operation: OperationRow) =>
        operation.operation__id !== transferFormData?.from_operation,
    );

    setSchema(
      createTransferSchema(
        operators,
        fromOperatorOperations,
        filteredToOperatorOperations,
        facilitiesRes.rows,
      ),
    );

    setFormState({
      ...transferFormData,
      facilities: [],
    });

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
    const updatedFormData = e.formData as TransferFormData;
    // we can't transfer facilities to the same operation
    if (
      updatedFormData.transfer_entity === "Facility" &&
      updatedFormData.from_operation === updatedFormData.to_operation
    ) {
      setError("Cannot transfer facilities to the same operation!" as any);
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

    if (!response || response?.error) {
      setDisabled(false);
      setError(response?.error as any);
      return;
    }

    setDisabled(true);
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
                setFormState(updatedFormData);

                handleFormStateUpdate(updatedFormData);
                setDisabled(!formIsValid(updatedFormData));
              }}
              onSubmit={submitHandler}
              omitExtraData={true}
            >
              <div className="min-h-6">
                {error && <Alert severity="error">{error}</Alert>}
              </div>
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
