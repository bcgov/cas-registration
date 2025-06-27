"use client";

import { useRouter } from "next/navigation";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { Button, Link } from "@mui/material";
import complianceUnitsColumns from "@/compliance/src/app/components/datagrid/models/compliance-units/complianceUnitsColumns";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { ComplianceAppliedUnits } from "@/compliance/src/app/types";
import SimpleAccordion from "@bciers/components/accordion/SimpleAccordion";

export interface ComplianceUnitsProps {
  complianceSummaryId: string;
  appliedComplianceUnits: Array<ComplianceAppliedUnits>;
}

export const ComplianceUnitsGrid = ({
  value,
}: {
  value: ComplianceUnitsProps;
}) => {
  const { complianceSummaryId, appliedComplianceUnits } = value;

  const router = useRouter();

  const handleApplyComplianceUnits = () =>
    router.push(
      `/compliance-summaries/${complianceSummaryId}/apply-compliance-units`,
    );

  const columns = complianceUnitsColumns();

  return (
    <SimpleAccordion title="Compliance Units Applied">
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
        initialData={{
          rows: appliedComplianceUnits,
          row_count: appliedComplianceUnits.length,
        }}
        // Adjust the height of the grid and the overlay wrapper to fit the content
        sx={{
          "& .MuiDataGrid-virtualScroller": {
            height: "fit-content",
            minHeight: "10vh",
          },
          "& .MuiDataGrid-overlayWrapper": {
            height: "0vh",
          },
        }}
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
    </SimpleAccordion>
  );
};
