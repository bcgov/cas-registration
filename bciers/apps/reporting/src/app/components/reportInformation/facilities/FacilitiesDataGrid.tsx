"use client";

import React, { useState, useMemo, useCallback } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { actionHandler } from "@bciers/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { FacilityRow } from "@reporting/src/app/components/reportInformation/facilities/types";
import getFacilityColumns from "@reporting/src/app/components/datagrid/models/facilities/getFacilityColumns";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import facilityTableGroupColumns from "@reporting/src/app/components/datagrid/models/facilities/facilityGroupColumns";

interface FacilitiesDataGridProps {
  initialData: {
    rows: FacilityRow[];
    row_count: number;
    is_completed_count: number;
  };
  version_id: number;
}

const FacilitiesDataGrid: React.FC<FacilitiesDataGridProps> = ({
  initialData,
  version_id,
}) => {
  const [rows, setRows] = useState(initialData);
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);
  const [allCompleted, setAllCompleted] = useState(
    initialData.row_count === initialData.is_completed_count,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updatedFacilities, setUpdatedFacilities] = useState<
    Record<string, FacilityRow>
  >({});

  const router = useRouter();

  const saveAndContinueUrl = `/reports/${version_id}/additional-reporting-data`;

  const browserSearchParams = useSearchParams();

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const columnGroup = useMemo(
    () => facilityTableGroupColumns(SearchCell),
    [SearchCell],
  );

  const columns = useMemo(() => {
    const handleCheckboxChange = (rowIndex: number, checked: boolean) => {
      const updatedRows = [...rows.rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        is_completed: checked,
      };
      setRows({ ...rows, rows: updatedRows });

      // Disable the button unless all rows are marked as completed.
      let allLocalCompleted = updatedRows.every((r) => r.is_completed);
      const globalIncompleteCount = rows.row_count - rows.is_completed_count;
      const shouldEnableButton =
        allLocalCompleted && globalIncompleteCount - updatedRows.length <= 0;
      setAllCompleted(shouldEnableButton);

      //stores the changes made to the facility rows' `is_completed` status
      setUpdatedFacilities((prevState) => ({
        ...prevState,
        [updatedRows[rowIndex].facility]: updatedRows[rowIndex],
      }));
    };

    return getFacilityColumns(handleCheckboxChange, version_id);
  }, [rows, version_id]);

  const saveData = async (redirect: boolean) => {
    setIsSaving(true);
    setErrors([]);
    try {
      const endpoint = `reporting/report-version/${version_id}/facility-report-list`;
      await actionHandler(endpoint, "PATCH", endpoint, {
        body: JSON.stringify(Object.values(updatedFacilities)),
      });
      if (redirect) {
        setIsRedirecting(true);
        router.push(saveAndContinueUrl);
      } else {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error: any) {
      setErrors([error.message || "An error occurred while saving."]);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchPageData = useCallback(async () => {
    const searchParams = Object.fromEntries(browserSearchParams.entries());

    const newRows = await fetchFacilitiesPageData({
      version_id,
      searchParams,
    });

    (newRows.rows as FacilityRow[]).forEach((r) => {
      if (r.facility in updatedFacilities) {
        r.is_completed = updatedFacilities[r.facility].is_completed;
      }
    });

    setRows(newRows);
    return newRows;
  }, [version_id, browserSearchParams]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveData(false);
      }}
    >
      <MultiStepHeader stepIndex={1} steps={multiStepHeaderSteps} />
      <div className="w-full form-group field field-object form-heading-label">
        <div className="form-heading">Report Information</div>
      </div>

      <Typography
        variant="body2"
        color={BC_GOV_BACKGROUND_COLOR_BLUE}
        fontStyle="italic"
        fontSize={16}
        className="mb-5"
      >
        All facility reports must be marked complete before continuing.
      </Typography>

      <DataGrid
        columns={columns}
        fetchPageData={fetchPageData}
        columnGroupModel={columnGroup}
        paginationMode="server"
        initialData={rows}
        pageSize={10}
      />

      {errors.length > 0 && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {errors.map((error, idx) => (
            <div key={idx}>{error}</div>
          ))}
        </div>
      )}

      <ReportingStepButtons
        backUrl={`/reports/${version_id}/previous-step`}
        continueUrl={saveAndContinueUrl}
        isSaving={isSaving}
        isSuccess={isSuccess}
        isRedirecting={isRedirecting}
        saveButtonDisabled={isSaving}
        submitButtonDisabled={!allCompleted || isSaving}
        saveAndContinue={() => saveData(true)}
        noFormSave={() => saveData(false)}
      />
    </form>
  );
};

export default FacilitiesDataGrid;
