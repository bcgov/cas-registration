import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import { ChangeItem } from "../constants/types";
import {
  getChangeValue,
  parseSegments,
  renderDiffTree,
  SegmentedChange,
  SourceTypeGroup,
} from "../utils/activityViewHelpers";
import { dataCardStyle } from "../constants/styles";
import { renderObject } from "../utils/activityRenderUtils";
import { Box } from "@mui/material";

interface SharedSourceTypeDiffViewProps {
  classNames: string;
  label: string;
  readonly: boolean;
  reportingFieldDisplayTitleBySlug: Record<string, string>;
}

interface WholeSourceTypeDiffViewProps {
  changeItem: ChangeItem;
  sourceTypeName: string;
}

interface SourceTypeDiffViewProps {
  sourceTypeGroup: SourceTypeGroup;
  sourceTypeName: string;
  reportingFieldDisplayTitleBySlug: Record<string, string>;
}

export const WholeSourceTypeDiffView: React.FC<
  WholeSourceTypeDiffViewProps & SharedSourceTypeDiffViewProps
> = (props) => {
  const change = props.changeItem;
  const value = getChangeValue(change);
  return (
    <SourceTypeBoxTemplate
      {...props}
      sourceTypeChange={{
        type: change.change_type as "added" | "removed",
      }}
      isDeleted={change.change_type === "removed"}
      description={
        <div style={dataCardStyle}>
          {renderObject(
            value,
            "",
            change.change_type === "removed",
            props.reportingFieldDisplayTitleBySlug,
          )}
        </div>
      }
    />
  );
};

export const PartialSourceTypeDiffView: React.FC<
  SourceTypeDiffViewProps & SharedSourceTypeDiffViewProps
> = (props) => {
  // Individual fields within the source type changed — render diff tree
  const segmentedChanges: SegmentedChange[] = props.sourceTypeGroup.fields.map(
    ({ path, change }) => ({
      segs: parseSegments(path),
      change,
    }),
  );

  return (
    <SourceTypeBoxTemplate
      {...props}
      description={
        <Box ml={1}>
          {renderDiffTree(
            segmentedChanges,
            props.reportingFieldDisplayTitleBySlug,
          )}
        </Box>
      }
    />
  );
};

export const SourceTypeDiffView: React.FC<SourceTypeDiffViewProps> = (
  props,
) => {
  const { sourceTypeGroup, sourceTypeName } = props;
  const sharedProps: SharedSourceTypeDiffViewProps = {
    classNames: "source-type-box",
    label: sourceTypeName,
    readonly: false,
    reportingFieldDisplayTitleBySlug: props.reportingFieldDisplayTitleBySlug,
  };

  if (sourceTypeGroup.whole)
    return (
      <WholeSourceTypeDiffView
        changeItem={sourceTypeGroup.whole}
        sourceTypeName={sourceTypeName}
        {...sharedProps}
      />
    );

  return (
    <PartialSourceTypeDiffView
      sourceTypeGroup={sourceTypeGroup}
      sourceTypeName={sourceTypeName}
      {...sharedProps}
    />
  );
};
