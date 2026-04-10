import {
  formatKey,
  singularizeLabel,
} from "@reporting/src/app/components/shared/activityRenderUtils";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";
import React from "react";
import { Box, Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import { dataCardStyle } from "@reporting/src/app/components/changeReview/constants/styles";
import { renderObject as renderActivityObject } from "@reporting/src/app/components/changeReview/utils/activityRenderUtils";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import { ChangeItemDisplay } from "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay";
import { ActivitiesViewProps } from "@reporting/src/app/components/finalReview/reportTypes";

/** Uses space-separated strings as-is (backend-translated), otherwise camelCase → Title Case. */
export const getDisplayName = (key: string) =>
  key.includes(" ") ? key : formatKey(key);

/** Returns false for empty arrays and primitives (e.g. id: 5). */
export const isDisplayableSourceType = (value: unknown) =>
  Array.isArray(value)
    ? value.length > 0
    : typeof value === "object" && value !== null;

// ---------------------------------------------------------------------------
// Source-type change helper
// ---------------------------------------------------------------------------

export const getSourceTypeChange = (
  stName: string,
  sourceTypeChange: ActivitiesViewProps["sourceTypeChange"],
  activityIsAdded: boolean,
  isSourceTypeDeleted: boolean,
): { type: "added" | "removed" | "modified" } | undefined => {
  if (sourceTypeChange?.name.split(",").includes(stName))
    return { type: isSourceTypeDeleted ? "removed" : "added" };
  if (activityIsAdded) return { type: "added" };
  return undefined;
};

/* ─── Path Parsing ─────────────────────────────────────────────── */

/**
 * Matches a single bracket-notation segment at the start of a string.
 * e.g. ['name'], ["name"], or [0]
 */
export const SEGMENT_RE = /^\[(?:'([^']+)'|"([^"]+)"|(\d+))]/;

/** Matches all bracket-notation segments anywhere in a string. */
export const ALL_SEGMENTS_RE = /\[(?:'([^']+)'|"([^"]+)"|(\d+))]/g;

/** Returns the first non-null capture group from a regex match. */
export const extractMatch = (m: RegExpMatchArray) =>
  m[1] ?? m[2] ?? m[3] ?? null;

/**
 * Returns the value of the bracket segment immediately after `marker` in `field`.
 * e.g. getSegmentAfter("['facility_reports']['Facility A']", "['facility_reports']") → "Facility A"
 */
export const getSegmentAfter = (
  field: string,
  marker: string,
): string | null => {
  const idx = field.indexOf(marker);
  if (idx === -1) return null;
  const match = field.slice(idx + marker.length).match(SEGMENT_RE);
  return match ? extractMatch(match) : null;
};

/**
 * Parses all bracket-notation segments from a path string into an ordered array.
 * e.g. "['emission_categories'][0]['value']" → ["emission_categories", "0", "value"]
 */
export const parseSegments = (path: string): string[] =>
  Array.from(path.matchAll(ALL_SEGMENTS_RE)).map((m) => extractMatch(m) ?? "");

/** Structured result of parsing a change field path. */
export interface ParsedActivityField {
  facilityName: string;
  activityName: string;
  /** Null when the change targets the entire activity (no source type). */
  sourceTypeName: string | null;
  /** True when the change covers the whole activity object, not a nested field. */
  isWholeActivity: boolean;
  /** The remaining path after the source-type segment (empty for whole-source-type changes). */
  remainingPath: string;
}

/**
 * Parses a change field path into its facility, activity, and source-type components.
 * Returns null if the field is not an activity-data path.
 *
 * Expected path shape:
 *   ['facility_reports']['<facility>']['activity_data']['<activity>']
 *   ['facility_reports']['<facility>']['activity_data']['<activity>']['source_types']['<sourceType>'][...remaining]
 */
export const parseActivityField = (
  field: string,
): ParsedActivityField | null => {
  if (!field.includes("['activity_data']")) return null;

  const facilityName = getSegmentAfter(field, "['facility_reports']");
  const activityName = getSegmentAfter(field, "['activity_data']");
  if (!facilityName || !activityName) return null;

  // No source_types segment → the whole activity was added/removed
  if (!field.includes("['source_types']"))
    return {
      facilityName,
      activityName,
      sourceTypeName: null,
      isWholeActivity: true,
      remainingPath: "",
    };

  const sourceTypeName = getSegmentAfter(field, "['source_types']");
  const afterSourceType = field.slice(
    field.indexOf("['source_types']") + "['source_types']".length,
  );
  const sourceTypeSegment = afterSourceType.match(SEGMENT_RE);
  // Everything after the source-type key is the "remaining" sub-path
  const remainingPath = sourceTypeSegment
    ? afterSourceType.slice(sourceTypeSegment[0].length)
    : "";

  return {
    facilityName,
    activityName,
    sourceTypeName,
    isWholeActivity: false,
    remainingPath,
  };
};

/* ─── Grouping ──────────────────────────────────────────────────── */

/** Holds changes for a single source type: either the whole object or individual field changes. */
export type SourceTypeGroup = {
  /** Set when the entire source type was added or removed. */
  whole?: ChangeItem;
  /** Individual field-level changes within this source type. */
  fields: Array<{ path: string; change: ChangeItem }>;
};

/** Holds changes for a single activity: either the whole activity or per-source-type changes. */
export type ActivityGroup = {
  /** Set when the entire activity was added or removed. */
  whole?: ChangeItem;
  sourceTypes: Record<string, SourceTypeGroup>;
};

/** Top-level structure: facility → activity → grouped changes. */
export type GroupedChanges = Record<string, Record<string, ActivityGroup>>;

/**
 * Groups a flat list of ChangeItems into a nested facility → activity → source-type structure
 * so the UI can render them hierarchically.
 */
export const groupActivityChanges = (changes: ChangeItem[]): GroupedChanges =>
  changes.reduce<GroupedChanges>((acc, change) => {
    const parsed = parseActivityField(change.field);
    if (!parsed) return acc;

    const {
      facilityName,
      activityName,
      sourceTypeName,
      isWholeActivity,
      remainingPath,
    } = parsed;

    acc[facilityName] ??= {};
    acc[facilityName][activityName] ??= { sourceTypes: {} };

    const activityGroup = acc[facilityName][activityName];

    if (isWholeActivity) {
      activityGroup.whole = change;
      return acc;
    }

    if (!sourceTypeName) return acc;

    activityGroup.sourceTypes[sourceTypeName] ??= { fields: [] };
    const stGroup = activityGroup.sourceTypes[sourceTypeName];

    if (!remainingPath) stGroup.whole = change;
    else stGroup.fields.push({ path: remainingPath, change });

    return acc;
  }, {});

/* ─── Diff Tree Renderer ────────────────────────────────────────── */

/** A change item paired with its path broken into ordered segments for tree rendering. */
export interface SegmentedChange {
  segs: string[];
  change: ChangeItem;
}

/**
 * Resolves the display value from a ChangeItem.
 * Uses `oldValue` for removed items and `newValue` for all others,
 * supporting both camelCase and snake_case property names.
 */
export const getChangeValue = (change: ChangeItem) => {
  const oldValue = (change as any).oldValue ?? (change as any).old_value;
  const newValue = (change as any).newValue ?? (change as any).new_value;
  return change.change_type === "removed" ? oldValue : newValue;
};

/**
 * Renders a leaf node whose value is an object (e.g. an entire emission category).
 * Shows the label with an added/removed badge, then the object's fields indented below.
 */
export const ObjectLeafNode: React.FC<{
  label: string;
  changeType: string;
  value: object;
}> = ({ label, changeType, value }) => (
  <Box mb={1}>
    <Typography
      sx={{
        fontWeight: 600,
        color: BC_GOV_BACKGROUND_COLOR_BLUE,
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {label}
      {changeType === "added" && <StatusLabel type="added" />}
      {changeType === "removed" && <StatusLabel type="removed" />}
    </Typography>
    <Box ml={2} style={dataCardStyle}>
      {renderActivityObject(value, "", changeType === "removed")}
    </Box>
  </Box>
);

/**
 * Renders an intermediate branch in the diff tree — a labelled group
 * that contains nested child nodes.
 */
export const BranchNode: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <Box mb={1}>
    <Typography
      sx={{
        fontWeight: 600,
        color: BC_GOV_BACKGROUND_COLOR_BLUE,
        fontSize: "0.9rem",
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Box ml={2}>{children}</Box>
  </Box>
);

/**
 * Method to build a group information based on two paths
 *
 * @param first first path
 * @param second second path
 * @returns [groupKey, groupLabel, isIndexed] and array with the group's key,
 * label and a flag whether the group is indexed
 */
const buildGroupInfo = (
  first: string,
  second: string,
): [string, string, boolean] => {
  const isIndexedGroup = second !== undefined && /^\d+$/.test(second);
  const groupKey = isIndexedGroup ? `${first}[${second}]` : first;

  let groupLabel: string;
  if (isIndexedGroup)
    groupLabel = `${singularizeLabel(first)} ${Number(second) + 1}`;
  else if (/^\d+$/.test(first)) groupLabel = `#${Number(first) + 1}`;
  else groupLabel = formatKey(first);

  return [groupKey, groupLabel, isIndexedGroup];
};
/**
 * Recursively renders a list of segmented changes as a labelled diff tree.
 *
 * - Items with no remaining segments are rendered as leaf nodes
 *   (scalar → ChangeItemDisplay, object → ObjectLeafNode).
 * - Items sharing a common leading segment are grouped under a BranchNode
 *   and rendered recursively.
 * - Numeric second segments are treated as array indices and produce
 *   human-readable labels like "Emission Category 1".
 */
export const renderDiffTree = (items: SegmentedChange[]): React.ReactNode => {
  if (!items.length) return null;

  // Group items by their leading path segment so siblings are rendered together
  const grouped = new Map<
    string,
    { label: string; children: SegmentedChange[] }
  >();

  for (const item of items) {
    const [first, second, ...rest] = item.segs;
    if (first === undefined) continue;

    // If the second segment is a numeric index, group by "field[index]"
    const [groupKey, groupLabel, isIndexedGroup] = buildGroupInfo(
      first,
      second,
    );
    const childSegs = isIndexedGroup
      ? rest
      : second === undefined
        ? []
        : [second, ...rest];

    if (grouped.has(groupKey)) {
      grouped
        .get(groupKey)!
        .children.push({ segs: childSegs, change: item.change });
    } else {
      grouped.set(groupKey, {
        label: groupLabel,
        children: [{ segs: childSegs, change: item.change }],
      });
    }
  }

  return (
    <>
      {Array.from(grouped.entries()).map(([key, { label, children }]) => {
        const isSingleLeaf =
          children.length === 1 && children[0].segs.length === 0;

        if (isSingleLeaf) {
          const { change } = children[0];
          const value = getChangeValue(change);

          // Object value → show all its sub-fields in a card
          if (value && typeof value === "object")
            return (
              <ObjectLeafNode
                key={key}
                label={label}
                changeType={change.change_type}
                value={value}
              />
            );

          // Scalar value → standard change row
          return (
            <ChangeItemDisplay
              key={key}
              item={{ ...change, displayLabel: label }}
            />
          );
        }

        // Multiple children or deeper path → recurse into a branch
        return (
          <BranchNode key={key} label={label}>
            {renderDiffTree(children)}
          </BranchNode>
        );
      })}
    </>
  );
};
