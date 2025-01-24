"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import facilityGroupColumns from "@reporting/src/app/components/datagrid/models/facilities/facilityGroupColumns";
import { FacilityRow } from "@reporting/src/app/components/operations/types";
import { fetchOperationsPageData } from "@bciers/actions/api";
import facilityColumns from "@reporting/src/app/components/datagrid/models/facilities/facilityColumns";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";

const FacilitiesDataGrid = ({
  initialData,
}: {
  initialData: {
    rows: FacilityRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columns = facilityColumns();

  const columnGroup = useMemo(
    () => facilityGroupColumns(false, SearchCell),
    [SearchCell],
  );

  return (
    <>
      <MultiStepHeader
        stepIndex={1}
        steps={multiStepHeaderSteps}
      ></MultiStepHeader>
      <DataGrid
        columns={columns}
        columnGroupModel={columnGroup}
        fetchPageData={fetchOperationsPageData}
        paginationMode="server"
        initialData={initialData}
      />
      <ReportingStepButtons
        key="form-buttons"
        backUrl={"backUrl"}
        continueUrl={"continueUrl"}
        isSaving={false}
        isSuccess={false}
        isRedirecting={false}
        saveButtonDisabled={false}
        submitButtonDisabled={false}
        saveAndContinue={() => {}}
        buttonText={"Continue"}
      />
    </>
  );
};

export default FacilitiesDataGrid;
