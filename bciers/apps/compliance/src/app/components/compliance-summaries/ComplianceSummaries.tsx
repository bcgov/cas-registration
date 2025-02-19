"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ComplianceSummariesSearchParams, ComplianceSummary } from "./types";
import Button from "@mui/material/Button";
import Link from "next/link";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ComplianceSummariesDataGrid from "./ComplianceSummariesDataGrid";
import { fetchComplianceSummariesPageData } from "./fetchComplianceSummariesPageData";

export default async function ComplianceSummaries({
  searchParams,
}: {
  searchParams: ComplianceSummariesSearchParams;
}) {
  // Fetch compliance summaries data
  const complianceSummaries = await fetchComplianceSummariesPageData(searchParams);
  if (!complianceSummaries) {
    return <div>No compliance summaries data in database.</div>;
  }

  return (
    <div className="mt-4">
      <ComplianceSummariesDataGrid initialData={complianceSummaries} />
    </div>
  );
} 