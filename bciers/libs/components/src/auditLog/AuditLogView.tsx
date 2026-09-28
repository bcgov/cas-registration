import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getAuditLog } from "@bciers/actions/api";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";
import { BC_GOV_BG_YELLOW } from "@bciers/styles/colors";
import {
  AuditLogEntry,
  AuditLogListResponse,
  AuditLogSnapshotField,
} from "./types";
import BackButton from "./BackButton";

// 🛠️ Format a snapshot field value for display
const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

interface FieldColumn {
  key: string;
  label: string;
}

/**
 * Collects the full set of watched-field columns across all entries, in first-seen
 * (oldest-to-newest) order. A single entry's snapshot isn't guaranteed to have every
 * key -- a field added to the registry after some entries were recorded won't appear
 * in those older snapshots -- so the columns are built from the whole history.
 */
const collectFieldColumns = (
  entriesOldestFirst: AuditLogEntry[],
): FieldColumn[] => {
  const columns = new Map<string, FieldColumn>();
  entriesOldestFirst.forEach((entry) => {
    Object.entries(entry.snapshot).forEach(([key, field]) => {
      if (!columns.has(key)) columns.set(key, { key, label: field.label });
    });
  });
  return [...columns.values()];
};

interface AuditLogViewProps {
  entityType: string;
  entityId: string;
}

/**
 * 📜 Proof-of-concept, generic audit log viewer.
 * Fetches and renders the audit log history for a given entity type/id
 * (e.g. "operation" or "report_version") as a plain MUI table, most-recent-first.
 */
const AuditLogView = async ({
  entityType,
  entityId,
}: Readonly<AuditLogViewProps>) => {
  const response: AuditLogListResponse = await getAuditLog(
    entityType,
    entityId,
  );
  const { entity_display_name: entityDisplayName, entries } = response ?? {
    entity_display_name: entityId,
    entries: [],
  };

  // Sort most-recent-first client-side in case the API doesn't guarantee order
  const sortedEntries = [...(entries ?? [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const fieldColumns = collectFieldColumns([...sortedEntries].reverse());

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <div>
        <BackButton />
      </div>
      <Typography variant="h5">Audit Log: {entityDisplayName}</Typography>
      {sortedEntries.length === 0 ? (
        <Typography>No audit log entries found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label={`Audit log for ${entityDisplayName}`}>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Reason</TableCell>
                {fieldColumns.map((column) => (
                  <TableCell key={column.key}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEntries.map((entry, index) => {
                // sortedEntries is newest-first, so the chronologically previous
                // entry -- the one to diff a changed field's "old" value against --
                // sits at the next index.
                const previousEntry = sortedEntries[index + 1];
                return (
                  <TableRow key={`${entry.timestamp}-${index}`}>
                    <TableCell sx={{ whiteSpace: "pre-line" }}>
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.actor_guid ?? "System"}</TableCell>
                    <TableCell>{entry.reason ?? "-"}</TableCell>
                    {fieldColumns.map((column) => {
                      const field: AuditLogSnapshotField | undefined =
                        entry.snapshot[column.key];
                      const newValue = formatFieldValue(field?.value);
                      const previousField: AuditLogSnapshotField | undefined =
                        previousEntry?.snapshot[column.key];
                      const isChanged =
                        entry.changed_fields.includes(column.key) &&
                        previousField !== undefined;

                      if (!isChanged) {
                        return (
                          <TableCell key={column.key}>{newValue}</TableCell>
                        );
                      }

                      const oldValue = formatFieldValue(previousField.value);
                      return (
                        <TableCell
                          key={column.key}
                          sx={{ backgroundColor: BC_GOV_BG_YELLOW }}
                        >
                          <span style={{ textDecoration: "line-through" }}>
                            {oldValue}
                          </span>{" "}
                          → <strong>{newValue}</strong>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default AuditLogView;
