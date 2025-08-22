"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";
import { AlertIcon } from "@bciers/components/icons";
import { BC_GOV_YELLOW } from "@bciers/styles";
import { AppRoutes } from "@/compliance/src/app/utils/constants";

// helpers local to the client component
const leafOf = (s: string) =>
  s.split(/[?#]/, 1)[0].split("/").filter(Boolean).pop()?.toLowerCase() ?? "";

const isExcludedLeaf = (leafOrPath: string) => {
  const excluded = new Set<string>([
    leafOf(AppRoutes.DOWNLOAD_PAYMENT_INSTRUCTIONS),
    // add more exclusions here if needed
  ]);
  return excluded.has(leafOf(leafOrPath));
};

type Props = {
  /** Preformatted date/time string (server-fetched) */
  lastUpdated?: string;
  /** Whether data is fresh (server-fetched) */
  dataIsFresh?: boolean;
};

export function ElicensingStaleDataAlert({ lastUpdated, dataIsFresh }: Props) {
  // re-renders on client nav between sibling pages
  const segs = useSelectedLayoutSegments();
  const leaf = (segs[segs.length - 1] ?? "").toLowerCase();

  // hide if excluded leaf or data is fresh
  if (isExcludedLeaf(leaf) || dataIsFresh) return null;

  return (
    <AlertNote icon={<AlertIcon fill={BC_GOV_YELLOW} width="20" height="20" />}>
      Connection to source could not be established. Invoice data last updated{" "}
      <strong>{lastUpdated}</strong>. Refreshing the page may resolve this
      issue. If the problem persists, contact{" "}
      <a href={ghgRegulatorEmail}>ghgregulator@gov.bc.ca</a> for help.
    </AlertNote>
  );
}

export default ElicensingStaleDataAlert;
