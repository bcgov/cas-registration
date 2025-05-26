"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { Button, Link } from "@mui/material";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import complianceUnitsColumns from "@/compliance/src/app/components/datagrid/models/compliance-units/complianceUnitsColumns";
import complianceUnitsGroupColumns from "@/compliance/src/app/components/datagrid/models/compliance-units/complianceUnitsGroupColumns";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import AlertNote from "@bciers/components/form/components/AlertNote";

interface ComplianceUnitsProps {
  complianceSummaryId: string;
  gridData: {
    rows: Array<{
      id: number;
      type: string;
      serialNumber: string;
      vintageYear: string;
      quantityApplied: string;
      equivalentEmissionReduced: string;
      equivalentValue: string;
      status: string;
    }>;
    row_count: number;
  };
}

export const ComplianceUnitsGrid = ({
  value,
}: {
  value: ComplianceUnitsProps;
}) => {
  const { complianceSummaryId, gridData } = value;

  const router = useRouter();
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const handleApplyComplianceUnits = () =>
    router.push(
      `/compliance-summaries/${complianceSummaryId}/apply-compliance-units`,
    );

  const columns = complianceUnitsColumns();

  const columnGroup = useMemo(
    () => complianceUnitsGroupColumns(SearchCell),
    [SearchCell],
  );

  return (
    <>
      <AlertNote>
        You may use compliance units (earned credits, offset units) you hold in
        the{" "}
        <Link
          href={bcCarbonRegistryLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          B.C. Carbon Registry (BCCR)
        </Link>{" "}
        to meet up to 50% of the compliance obligation below. The remaining
        balance must be met with monetary payment(s).
      </AlertNote>
      <DataGrid
        columns={columns}
        initialData={gridData}
        columnGroupModel={columnGroup}
      />
      <div className="flex justify-end mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyComplianceUnits}
          className="p-3"
        >
          Apply Compliance Units
        </Button>
      </div>
    </>
  );
};
