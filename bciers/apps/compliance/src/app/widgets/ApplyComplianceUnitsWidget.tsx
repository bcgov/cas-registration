"use client";

import { useState } from "react";
import { WidgetProps } from "@rjsf/utils";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import applyComplianceUnitsColumns from "@/compliance/src/app/components/datagrid/models/apply-compliance-units/applyComplianceUnitsColumns";
import { BccrUnit } from "@/compliance/src/app/types";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { ComplianceLimitStatus } from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent";

const COMPLIANCE_LIMIT_MESSAGES: Record<
  ComplianceLimitStatus,
  JSX.Element | null
> = {
  EXCEEDS: (
    <AlertNote>
      At least 50% of the compliance obligation must be met with monetary
      payment(s). The compliance units (earned credits, offset units) you
      selected below have exceeded the limit, please reduce the quantity to be
      applied to proceed.
    </AlertNote>
  ),
  EQUALS: (
    <AlertNote>
      The compliance units (earned credits, offset units) you selected below
      have reached 50% of the compliance obligation. The remaining balance must
      be met with monetary payment(s).
    </AlertNote>
  ),
  BELOW: null,
};

const ApplyComplianceUnitsWidget = ({
  value,
  onChange,
  formContext,
  readonly,
}: WidgetProps) => {
  const { chargeRate, complianceLimitStatus, isSubmitted } = formContext;
  const [localUnits, setLocalUnits] = useState<BccrUnit[]>(value);

  const handleUnitUpdate = (updatedUnit: BccrUnit) => {
    const updatedUnits = localUnits.map((unit: BccrUnit) =>
      unit.id === updatedUnit.id ? updatedUnit : unit,
    );
    setLocalUnits(updatedUnits);
    onChange?.(updatedUnits);
  };

  const columns = applyComplianceUnitsColumns(
    chargeRate,
    readonly,
    handleUnitUpdate,
  );

  return (
    <div className="w-full">
      {
        !isSubmitted && COMPLIANCE_LIMIT_MESSAGES[
          complianceLimitStatus as ComplianceLimitStatus
        ]
      }
      <DataGrid
        columns={columns}
        initialData={{ rows: localUnits, row_count: localUnits.length }}
        hideFooter={true}
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
    </div>
  );
};

export default ApplyComplianceUnitsWidget;
