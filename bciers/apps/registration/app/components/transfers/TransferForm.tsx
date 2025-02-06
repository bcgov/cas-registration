"use client";

import { useEffect, useState } from "react";
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
  const [key, setKey] = useState(Math.random()); // NOSONAR
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

  const updateUiSchemaWithError = (): void =>
    // Handling the error when the same operator is selected for both from and to operators when transferring an operation
    setUiSchema({
      ...uiSchema,
      operation: {
        ...uiSchema.operation,
        "ui:options": {
          ...uiSchema.operation["ui:options"],
          disabled: true,
        },
        "ui:help": (
          <small className="text-bc-error-red">
            <b>Note: </b>Cannot transfer an operation to the same operator
          </small>
        ),
      },
    });

  const resetUiSchema = () => setUiSchema(transferUISchema);

  const sameOperatorSelectedForOperationEntity = (): boolean =>
    !!formState?.from_operator &&
    !!formState?.to_operator &&
    formState?.from_operator === formState?.to_operator &&
    formState?.transfer_entity === "Operation";

  const fetchOperatorOperations = async (operatorId?: string) => {
    if (!operatorId) return [];
    const response: {
      rows: OperationRow[];
      row_count: number;
    } = await fetchOperationsPageData({
      paginate_results: false,
      operator_id: operatorId,
      sort_field: "operation__name",
      sort_order: "asc",
      end_date: true, // this indicates that the end_date is not null,
      status: "Active", // only fetch active facilities
    });
    if (!response || "error" in response || !response.rows) {
      setError("Failed to fetch operations data!" as any);
      return [];
    }
    return response.rows;
  };

  const handleOperatorChange = async () => {
    // Reset error state
    setError(undefined);
    // Handle the error when the same operator is selected for both from and to operators when transferring an operation
    if (sameOperatorSelectedForOperationEntity()) updateUiSchemaWithError();
    else resetUiSchema();

    const getFromOperatorOperations = await fetchOperatorOperations(
      formState?.from_operator,
    );

    const getByOperatorOperations = await fetchOperatorOperations(
      formState?.to_operator,
    );

    if (!error) {
      setFromOperatorOperations(getFromOperatorOperations);
      setToOperatorOperations(getByOperatorOperations);
      setSchema(
        createTransferSchema(
          operators,
          getFromOperatorOperations,
          getByOperatorOperations,
        ),
      );

      // reset selected operation, from_operation, to_operation and facilities when changing the operator
      // Not doing this will cause the form to keep the old values when changing the operator
      setFormState({
        ...formState,
        operation: "",
        from_operation: "",
        to_operation: "",
        facilities: [],
      });
    }
  };

  const fetchFacilities = async (operationId?: string) => {
    if (!operationId) return [];
    const response: {
      rows: FacilityRow[];
      row_count: number;
    } = await fetchFacilitiesPageData(operationId, {
      paginate_results: false,
      end_date: true, // this indicates that the end_date is not null,
      status: "Active", // only fetch active facilities
    });
    if (!response || "error" in response || !response.rows) {
      setError("Failed to fetch facilities data!" as any);
      return [];
    }
    return response.rows;
  };

  const handleFromOperationChange = async () => {
    // Reset error state
    setError(undefined);
    const facilitiesByOperation = await fetchFacilities(
      formState?.from_operation,
    );

    if (!error) {
      // Filter out the current from_operation from toOperatorOperations(we can't transfer facilities to the same operation)
      const filteredToOperatorOperations = toOperatorOperations.filter(
        (operation: OperationRow) =>
          operation.operation__id !== formState?.from_operation,
      );

      setSchema(
        createTransferSchema(
          operators,
          fromOperatorOperations,
          filteredToOperatorOperations,
          facilitiesByOperation,
        ),
      );
      // reset selected facilities when changing the from_operation
      setFormState({
        ...formState,
        facilities: [],
      });
      // force re-render
      setKey(Math.random()); // NOSONAR
    }
  };

  /*
  Using multiple useEffects to listen to changes in the form state and update the schema accordingly
  */
  useEffect(() => {
    handleOperatorChange();
  }, [
    formState?.from_operator,
    formState?.to_operator,
    formState?.transfer_entity,
  ]);

  useEffect(() => {
    handleFromOperationChange();
  }, [formState?.from_operation]);

  const submitHandler = async (e: IChangeEvent) => {
    const updatedFormData = e.formData;
    // we can't transfer facilities to the same operation
    if (
      updatedFormData.transfer_entity === "Facility" &&
      updatedFormData.from_operation === updatedFormData.to_operation
    ) {
      setError("Cannot transfer facilities to the same operation!" as any);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    // Update the form state with the new data so we don't use stale data on edit
    setFormState(updatedFormData);
    const endpoint = "registration/transfer-events";
    const response = await actionHandler(endpoint, "POST", "", {
      body: JSON.stringify({
        ...updatedFormData,
      }),
    });
    setIsSubmitting(false);
    if (!response || response?.error) {
      setDisabled(false);
      setError(response.error as any);
      return;
    } else {
      setDisabled(true);
      setIsSubmitted(true);
    }
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
                const updatedFormData = e.formData;
                setFormState(updatedFormData);
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
