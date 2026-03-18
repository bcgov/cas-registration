"use client";

import React, { useState, useMemo, useCallback } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { useRouter, useSearchParams } from "next/navigation";
import { Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { FacilityRow } from "@reporting/src/app/components/reportInformation/facilities/types";
import getFacilityColumns from "@reporting/src/app/components/datagrid/models/facilities/getFacilityColumns";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import facilityTableGroupColumns from "@reporting/src/app/components/datagrid/models/facilities/facilityGroupColumns";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { useOptimisticGrid } from "@bciers/hooks";

interface FacilitiesDataGridProps {
  initialData: {
    rows: FacilityRow[];
    row_count: number;
    is_completed_count: number;
  };
  version_id: number;
  navigationInformation: NavigationInformation;
}

const FacilitiesDataGrid: React.FC<FacilitiesDataGridProps> = ({
  initialData,
  version_id,
  navigationInformation,
}) => {
  const router = useRouter();
  const browserSearchParams = useSearchParams();

  // State
  const [pageData, setPageData] = useState(initialData);
  const [reportRowCount] = useState(initialData.row_count);
  const [completedCount, setCompletedCount] = useState(
    initialData.is_completed_count,
  );
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // AutoSave - Optimistic Hook Config
  const {
    isSaving,
    errors,
    saveChain,
    requestVersionRef,
    persistChange,
    applyOverrides,
  } = useOptimisticGrid<FacilityRow>({
    endpoint: `reporting/report-version/${version_id}/facility-report-list`,
    getRecordKey: (row) => row.facility,
    debounceMs: 500,
  });

  /**
   * handleCheckboxChange
   * Triggered by the DataGrid checkbox
   * Updates UI optimistically and queues a background PATCH via the hook
   */
  const handleCheckboxChange = useCallback(
    async (rowIndex: number, checked: boolean) => {
      const currentRow = pageData.rows[rowIndex];
      if (!currentRow || currentRow.is_completed === checked) return;

      const key = currentRow.facility;

      // Track the version of this specific interaction to prevent stale overwrites
      const nextVersion = (requestVersionRef.current[key] || 0) + 1;
      requestVersionRef.current[key] = nextVersion;

      // Optimistic updates
      setPageData((prev) => ({
        ...prev,
        rows: prev.rows.map((r, i) =>
          i === rowIndex ? { ...r, is_completed: checked } : r,
        ),
      }));
      setCompletedCount((prev) => (checked ? prev + 1 : prev - 1));

      // Persist the data
      await persistChange(
        { ...currentRow, is_completed: checked },
        nextVersion,
        () => {
          // Rollback on fails
          setPageData((prev) => ({
            ...prev,
            rows: prev.rows.map((r, i) =>
              i === rowIndex ? { ...r, is_completed: !checked } : r,
            ),
          }));
          setCompletedCount((prev) => (checked ? prev - 1 : prev + 1));
        },
      );
    },
    [pageData.rows, persistChange, requestVersionRef],
  );

  /**
   * fetchPageData
   * Called by DataGrid on pagination/search
   */
  const fetchPageData = useCallback(async () => {
    const searchParams = Object.fromEntries(browserSearchParams.entries());
    const data = await fetchFacilitiesPageData({ version_id, searchParams });

    // Ensure local "in-flight" changes persist over stale server responses
    const mergedRows = applyOverrides(data.rows);
    const mergedData = { ...data, rows: mergedRows };

    setPageData(mergedData);
    return mergedData;
  }, [browserSearchParams, version_id, applyOverrides]);

  const handleContinue = useCallback(async () => {
    try {
      setIsRedirecting(true);
      // Wait for all queued saves (including those in the debounce window) to resolve
      await saveChain.current;
      router.push(navigationInformation.continueUrl);
    } catch {
      setIsRedirecting(false);
    }
  }, [navigationInformation.continueUrl, router, saveChain]);

  // Grid Configurations
  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField],
  );

  const columnGroup = useMemo(
    () => facilityTableGroupColumns(SearchCell),
    [SearchCell],
  );

  const columns = useMemo(
    () => getFacilityColumns(handleCheckboxChange, version_id),
    [handleCheckboxChange, version_id],
  );

  // Main component
  return (
    <div>
      <MultiStepHeader
        stepIndex={navigationInformation.headerStepIndex}
        steps={navigationInformation.headerSteps}
      />

      <div className="w-full form-group field field-object form-heading-label mt-4">
        <div className="form-heading">Report Information</div>
      </div>

      <Typography
        variant="body2"
        color={BC_GOV_BACKGROUND_COLOR_BLUE}
        fontStyle="italic"
        fontSize={16}
        className="mb-5"
      >
        All facility reports in the Facilities table below must be marked as
        complete before you can continue.
      </Typography>

      <DataGrid
        columns={columns}
        fetchPageData={fetchPageData}
        columnGroupModel={columnGroup}
        paginationMode="server"
        initialData={pageData}
        pageSize={10}
        rowSelection={false}
      />

      {/* Error Display */}
      {errors.length > 0 && (
        <div
          className="mt-4 p-3 border border-red-500 rounded bg-red-50 text-red-700"
          role="alert"
        >
          {errors.map((error, idx) => (
            <div key={`${error}-${idx}`}>{error}</div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <ReportingStepButtons
        noSaveButton={true}
        backUrl={navigationInformation.backUrl}
        continueUrl={navigationInformation.continueUrl}
        isSaving={isSaving}
        isRedirecting={isRedirecting}
        // Button is locked if any saves are in flight OR not all rows are checked
        submitButtonDisabled={completedCount !== reportRowCount || isSaving}
        saveAndContinue={handleContinue}
        buttonText="Continue"
      />
    </div>
  );
};

export default FacilitiesDataGrid;
