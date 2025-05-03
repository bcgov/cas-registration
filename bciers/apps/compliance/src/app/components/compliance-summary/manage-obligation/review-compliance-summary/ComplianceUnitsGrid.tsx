"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TitleRow } from "../../TitleRow";
import { ComplianceUnitsAlertNote } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsAlertNote";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { Box, Button } from "@mui/material";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import complianceUnitsColumns from "@/compliance/src/app/components/datagrid/models/compliance-units/complianceUnitsColumns";
import complianceUnitsGroupColumns from "@/compliance/src/app/components/datagrid/models/compliance-units/complianceUnitsGroupColumns";
import {
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
} from "@bciers/styles";

interface ComplianceUnitsGridProps {
  data: any;
  complianceSummaryId?: number;
}

export const ComplianceUnitsGrid = ({
  data,
  complianceSummaryId,
}: ComplianceUnitsGridProps) => {
  const router = useRouter();
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const handleApplyComplianceUnits = () => {
    if (complianceSummaryId) {
      router.push(
        `/compliance-summaries/${complianceSummaryId}/manage-obligation/apply-compliance-units`,
      );
    }
  };

  const columns = complianceUnitsColumns();

  const columnGroup = useMemo(
    () => complianceUnitsGroupColumns(SearchCell),
    [SearchCell],
  );

  const initialData = {
    rows: [
      {
        id: 1,
        type: "-",
        serialNumber: "-",
        vintageYear: "-",
        quantityApplied: "-",
        equivalentEmissionReduced: "-",
        equivalentValue: "-",
        status: "-",
      },
    ],
    row_count: 1, // The total number of rows (should match rows.length)
  };
  const gridData = data == "" ? initialData : data;

  return (
    <div style={{ width: "100%", marginBottom: "50px" }}>
      <TitleRow label="Compliance Units Applied" />
      <ComplianceUnitsAlertNote />

      <DataGrid
        columns={columns}
        initialData={gridData}
        columnGroupModel={columnGroup}
        hideFooter={true}
        sx={{
          "& .MuiDataGrid-virtualScroller, & .mui-qvtrhg-MuiDataGrid-virtualScroller":
            {
              minHeight: "auto",
            },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyComplianceUnits}
          sx={{
            backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
            "&:hover": {
              backgroundColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
            },
            padding: "16px 41px",
          }}
        >
          Apply Compliance Units
        </Button>
      </Box>
    </div>
  );
};
