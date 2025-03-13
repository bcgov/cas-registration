"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { actionHandler } from "@bciers/actions";
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
import { NavigationInformation } from "../../taskList/types";

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
  const browserSearchParams = useSearchParams();

  const currentPage = Number(browserSearchParams.get("page")) || 1;

  // to check if all facilities are completed
  const [tablesData, setTablesData] = useState<Record<number, FacilityRow[]>>(
    {},
  );

  // total count of all non-completed facilities for the report
  const [globalIncompleteCount] = useState<number>(() => {
    return initialData.row_count - initialData.is_completed_count;
  });

  // to keep track of the # of uncompleted facilities in a page
  const [incompleteCountForPage, setIncompleteCountForPage] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    if (!(currentPage in tablesData)) {
      setTablesData((prev) => ({
        ...prev,
        [currentPage]: initialData.rows,
      }));
      setIncompleteCountForPage((prev) => ({
        ...prev,
        [currentPage]: initialData.rows.filter(
          (facilityRow) => !facilityRow.is_completed,
        ).length,
      }));
    }
  }, [initialData, currentPage]);

  const router = useRouter();

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

      //stores the changes made to the facility rows' `is_completed` status
      setUpdatedFacilities((prevState) => ({
        ...prevState,
        [updatedRows[rowIndex].facility]: updatedRows[rowIndex],
      }));

      setTablesData((prev) => {
        const updatedPage = [...(prev[currentPage] || [])];
        updatedPage[rowIndex] = {
          ...updatedPage[rowIndex],
          is_completed: checked,
        };
        const updatedTablesData = {
          ...prev,
          [currentPage]: updatedPage,
        };
        const allRows = Object.values(updatedTablesData).flat();
        const allPagesCompleted = allRows.every(
          (facilityRow) => facilityRow.is_completed,
        );

        const localIncompleteCount = Object.values(incompleteCountForPage)
          .flat()
          .reduce((acc, curr) => acc + curr, 0);

        const shouldEnableButton =
          allPagesCompleted &&
          globalIncompleteCount - localIncompleteCount <= 0;
        setAllCompleted(shouldEnableButton);

        return updatedTablesData;
      });
    };

    return getFacilityColumns(handleCheckboxChange, version_id);
  }, [
    rows,
    version_id,
    tablesData,
    incompleteCountForPage,
    globalIncompleteCount,
  ]);

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
        router.push(navigationInformation.continueUrl);
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

    const pageNumber = searchParams.page;
    if (!(pageNumber in tablesData)) {
      setTablesData((prev) => {
        return {
          ...prev,
          [pageNumber]: newRows.rows,
        };
      });

      setIncompleteCountForPage((prev) => ({
        ...prev,
        [pageNumber]: newRows.rows.filter(
          (facilityRow: FacilityRow) => !facilityRow.is_completed,
        ).length,
      }));
    }
    return newRows;
  }, [version_id, browserSearchParams, tablesData]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveData(false);
      }}
    >
      <MultiStepHeader
        stepIndex={navigationInformation.headerStepIndex}
        steps={navigationInformation.headerSteps}
      />
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
        All facility reports in the Facilities table below must be marked as
        complete before you can continue.
      </Typography>

      <DataGrid
        columns={columns}
        fetchPageData={fetchPageData}
        columnGroupModel={columnGroup}
        paginationMode="server"
        initialData={rows}
        pageSize={10}
        rowSelection={false}
      />

      {errors.length > 0 && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {errors.map((error, idx) => (
            <div key={idx}>{error}</div>
          ))}
        </div>
      )}

      <ReportingStepButtons
        backUrl={navigationInformation.backUrl}
        continueUrl={navigationInformation.continueUrl}
        isSaving={isSaving}
        isSuccess={isSuccess}
        isRedirecting={isRedirecting}
        saveButtonDisabled={isSaving}
        submitButtonDisabled={!allCompleted}
        saveAndContinue={() => saveData(true)}
        noFormSave={() => saveData(false)}
      />
    </form>
  );
};

export default FacilitiesDataGrid;
