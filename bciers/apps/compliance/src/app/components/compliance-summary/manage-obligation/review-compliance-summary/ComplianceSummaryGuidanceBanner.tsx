"use client";

import { Link } from "@mui/material";
import { complianceGuidanceLink } from "@bciers/utils/src/urls";
import AlertNote from "@bciers/components/form/components/AlertNote";

export const ComplianceSummaryGuidanceBanner = () => {
  return (
    <AlertNote alertType="INFO">
      For guidance on making monetary payments, using compliance units and
      general compliance information, refer to the{" "}
      <Link
        href={complianceGuidanceLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        compliance guidance document.
      </Link>{" "}
    </AlertNote>
  );
};
