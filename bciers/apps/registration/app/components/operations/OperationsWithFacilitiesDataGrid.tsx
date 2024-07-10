"use client";

import { useEffect, useMemo, useState } from "react";
import fetchFacilitiesGridData from "../facilities/fetchFacilitiesPageData";
import { OperationRow } from "./types";
import { FacilityRow } from "../facilities/types";
import { GridRowParams } from "@mui/x-data-grid";
import FacilityDataGrid from "../facilities/FacilityDataGrid";
import OperationDataGrid from "./OperationDataGrid";
import debounce from "lodash.debounce";

const OperationsWithFacilitiesDataGrid = ({
  initialData,
  isInternalUser = false,
}: {
  isInternalUser?: boolean;
  initialData: {
    rows: OperationRow[];
    row_count: number;
  };
}) => {
  const [selectedOperationData, setSelectedOperationData] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [facilitiesGridData, setFacilitiesGridData] = useState<{
    rows: FacilityRow[];
    row_count: number;
  } | null>(null);

  const selectedOperationId = selectedOperationData?.id;
  const selectedOperationName = selectedOperationData?.name;

  const isFacilitiesGridVisible =
    facilitiesGridData && selectedOperationId && selectedOperationName;

  useEffect(() => {
    const anchorTarget = document.getElementById("view-operation-facilities");

    // debounce the scrollIntoView function to prevent excessive calls
    const debouncedScrollIntoView = debounce(() => {
      anchorTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);

    if (isFacilitiesGridVisible) debouncedScrollIntoView();
  }, [facilitiesGridData]);

  const handleRowClick = (row: GridRowParams) => {
    const operationId = row.id.toString();

    const fetchData = async (id: string) => {
      const facilitiesData: {
        rows: FacilityRow[];
        row_count: number;
      } = await fetchFacilitiesGridData(id, {});
      return facilitiesData;
    };

    fetchData(operationId).then(async (data) => {
      const facilitiesData = { ...data };
      setSelectedOperationData({
        id: row.id.toString(),
        name: row.row.name,
      });
      setFacilitiesGridData(facilitiesData);
    });
  };

  const FacilitiesGridSectionMemo = useMemo(() => {
    return (
      <>
        {isFacilitiesGridVisible && (
          <>
            <h2 className="text-xl font-bold">
              Facilities for {selectedOperationName}
            </h2>
            <FacilityDataGrid
              key={selectedOperationId}
              operationId={selectedOperationId}
              initialData={facilitiesGridData}
            />
          </>
        )}
      </>
    );
  }, [
    isFacilitiesGridVisible,
    selectedOperationName,
    selectedOperationId,
    facilitiesGridData,
  ]);

  const OperationDataGridMemo = useMemo(() => {
    return (
      <OperationDataGrid
        key="operation-data-grid"
        initialData={initialData}
        isInternalUser={isInternalUser}
        onRowClick={handleRowClick}
      />
    );
  }, [initialData, isInternalUser]);

  return (
    <>
      {OperationDataGridMemo}
      <section id="view-operation-facilities" className="mt-8">
        {FacilitiesGridSectionMemo}
      </section>
    </>
  );
};

export default OperationsWithFacilitiesDataGrid;
