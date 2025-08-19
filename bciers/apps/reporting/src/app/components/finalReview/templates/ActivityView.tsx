import React from "react";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import {
  BC_GOV_BACKGROUND_COLOR_GREY,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  WHITE,
} from "@bciers/styles";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";

const styles = {
  sourceCard: {
    backgroundColor: WHITE,
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  dataCard: {
    backgroundColor: BC_GOV_BACKGROUND_COLOR_GREY,
    padding: "12px",
    marginTop: "10px",
    borderRadius: "6px",
  },
};

const verticalBorder = {
  borderLeft: `6px solid ${BC_GOV_PRIMARY_BRAND_COLOR_BLUE}`,
  marginLeft: "1rem",
  paddingLeft: "1rem",
  height: "50%",
  backgroundColor: "transparent",
  borderRadius: "7px",
};

type DynamicObject = {
  [key: string]:
    | string
    | number
    | boolean
    | DynamicObject
    | DynamicObject[]
    | null
    | undefined;
};

type ActivityItem = {
  activity: string;
  source_types: Record<string, DynamicObject | DynamicObject[]>;
};

interface ActivitiesViewProps {
  activity_data: ActivityItem[] | Record<string, any>;
  isAdded?: boolean;
  isDeleted?: boolean;
  changeType?: "added" | "deleted";
  sourceTypeChange?: {
    name: string;
    type: "added" | "deleted" | "modified";
    deletedSourceTypes?: Array<{
      name: string;
      data: any;
    }>;
  };
}

const excludedKeys = ["units", "fuels", "emissions", "fuelType"];

// --- Helper functions ---
const getDeletedStyles = (isDeleted: boolean) =>
  isDeleted ? { textDecoration: "line-through", color: "#666" } : {};

const formatKey = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

const renderObject = (
  obj: unknown,
  labelPrefix = "",
  isDeleted = false,
): React.ReactNode => {
  const deletedStyles = getDeletedStyles(isDeleted);

  if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      // Format the label prefix to singular form and proper case
      const formatLabel = (prefix: string) => {
        const lower = prefix.toLowerCase();
        if (lower === "units") return "Unit";
        if (lower === "fuels") return "Fuel";
        if (lower === "emissions") return "Emission";
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      };

      const title = labelPrefix
        ? `${formatLabel(labelPrefix)} ${index + 1}:`
        : "";
      const containerStyle = {
        marginLeft: 20,
        marginBottom: 8,
        ...(labelPrefix.toLowerCase() === "emissions" ? verticalBorder : {}),
      };
      return (
        <div key={`${labelPrefix}-${index}`} style={containerStyle}>
          {title && (
            <strong
              className="text-bc-bg-blue relative flex items-center"
              style={deletedStyles}
            >
              {title}
            </strong>
          )}
          <div style={{ marginLeft: 10 }}>
            {renderObject(item, labelPrefix, isDeleted)}
          </div>
        </div>
      );
    });
  }

  if (obj && typeof obj === "object") {
    return Object.entries(obj).map(([key, value], idx) => (
      <div key={`${key}-${idx}`} style={{ marginBottom: 4 }}>
        {!excludedKeys.includes(key.toLowerCase()) && (
          <strong style={deletedStyles}>{formatKey(key)}</strong>
        )}
        <span style={deletedStyles}>
          {typeof value === "object" && value !== null
            ? renderObject(value, key, isDeleted)
            : ` ${String(value)}`}
        </span>
      </div>
    ));
  }

  return <span style={deletedStyles}>{String(obj)}</span>;
};

const renderFuels = (
  sourceTypeValue: any,
  deletedStyles: React.CSSProperties,
) => (
  <div style={styles.dataCard}>
    {Object.entries(sourceTypeValue).map(([key, value]) => {
      if (["fuel name", "fuel unit"].includes(key.toLowerCase())) {
        return (
          <div key={key} style={{ marginBottom: 4 }}>
            <strong style={deletedStyles}>{formatKey(key)}</strong>
            <span style={deletedStyles}>{`: ${String(value)}`}</span>
          </div>
        );
      }
      return null;
    })}
  </div>
);

const getSourceTypeChange = (
  stName: string,
  sourceTypeChange: ActivitiesViewProps["sourceTypeChange"],
  activityIsAdded: boolean,
  isSourceTypeDeleted: boolean,
): { type: "added" | "deleted" | "modified" } | undefined => {
  if (sourceTypeChange?.name.split(",").includes(stName)) {
    return {
      type: isSourceTypeDeleted ? "deleted" : "added",
    };
  }
  if (activityIsAdded) {
    return { type: "added" };
  }
  return undefined;
};

// --- Component ---
export default function ActivitiesView({
  activity_data,
  isAdded = false,
  isDeleted = false,
  changeType,
  sourceTypeChange,
}: ActivitiesViewProps) {
  const activityIsAdded = isAdded || changeType === "added";
  const activityIsDeleted = isDeleted || changeType === "deleted";
  const deletedStyles = getDeletedStyles(activityIsDeleted);

  const activitiesArray = Array.isArray(activity_data)
    ? activity_data
    : Object.entries(activity_data).map(([activityName, activityData]) => ({
        activity: activityName,
        source_types: (activityData as any)?.source_types || activityData,
      }));

  return (
    <div>
      {activitiesArray.map((activityItem, activityIndex) => (
        <section key={activityIndex} style={{ marginBottom: 30 }}>
          <div>
            <h2
              className="py-2 font-bold text-bc-bg-blue"
              style={deletedStyles}
            >
              {activityItem.activity}
              {activityIsAdded && <StatusLabel type="added" />}
              {activityIsDeleted && <StatusLabel type="deleted" />}
            </h2>
          </div>

          {Object.entries(activityItem.source_types)
            .sort(([keyA], [keyB]) => {
              if (keyA.toLowerCase().includes("emissions")) return 1;
              if (keyB.toLowerCase().includes("emissions")) return -1;
              return 0;
            })
            .map(([sourceTypeName, sourceTypeValue], sourceTypeIndex) => {
              const isSourceTypeDeleted =
                sourceTypeChange?.deletedSourceTypes?.some(
                  (st) => st.name === sourceTypeName,
                );

              if (sourceTypeName.toLowerCase().includes("fuels")) {
                return (
                  <div key={sourceTypeIndex}>
                    {renderFuels(sourceTypeValue, deletedStyles)}
                  </div>
                );
              }

              return (
                <SourceTypeBoxTemplate
                  key={sourceTypeIndex}
                  classNames="source-type-box"
                  label={sourceTypeName}
                  description={
                    <div style={styles.dataCard}>
                      {typeof sourceTypeValue === "object"
                        ? renderObject(
                            sourceTypeValue,
                            "",
                            activityIsDeleted || isSourceTypeDeleted,
                          )
                        : String(sourceTypeValue)}
                    </div>
                  }
                  readonly={false}
                  isDeleted={activityIsDeleted || isSourceTypeDeleted}
                  sourceTypeChange={getSourceTypeChange(
                    sourceTypeName,
                    sourceTypeChange,
                    activityIsAdded,
                    isSourceTypeDeleted || false,
                  )}
                />
              );
            })}
        </section>
      ))}
    </div>
  );
}
