import React from "react";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import {
  BC_GOV_BACKGROUND_COLOR_GREY,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  WHITE,
} from "@bciers/styles";

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
  activity_data: ActivityItem[];
}

const excludedKeys = ["units", "fuels", "emissions", "fuel type"];

/**
 * Recursively renders an object or array into React nodes.
 * @param obj - The object or array to render.
 * @param labelPrefix - Optional prefix for labels.
 * @returns React nodes representing the object structure.
 */
function renderObject(obj: unknown, labelPrefix = ""): React.ReactNode {
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
            <strong className="text-bc-bg-blue relative flex items-center">
              {title}
            </strong>
          )}
          <div style={{ marginLeft: 10 }}>
            {renderObject(item, labelPrefix)}
          </div>
        </div>
      );
    });
  }

  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.entries(obj)
      .sort(([keyA], [keyB]) => {
        // Put units at the top
        if (keyA.toLowerCase().includes("unit")) return -1;
        if (keyB.toLowerCase().includes("unit")) return 1;

        // Put emissions at the bottom
        if (keyA.toLowerCase().includes("emission")) return 1;
        if (keyB.toLowerCase().includes("emission")) return -1;

        // Keep other items in between
        return 0;
      })
      .map(([key, value], idx) => (
        <div key={`${key}-${idx}`} style={{ marginBottom: 4 }}>
          {!excludedKeys.includes(key.toLowerCase()) && (
            <strong>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}
              <span style={{ marginRight: "1px" }}></span>
            </strong>
          )}
          {typeof value === "object" && value !== null
            ? renderObject(value, key)
            : ` ${String(value)}`}
        </div>
      ));
  }

  return <span>{String(obj)}</span>;
}
/**
 * ActivitiesView component renders a list of activities and their associated source types.
 * @param activity_data - Array of activity items containing activity name and source types.
 * @returns JSX element representing the activities view.
 */

export default function ActivitiesView({ activity_data }: ActivitiesViewProps) {
  return (
    <div>
      {activity_data.map((activityItem, activityIndex) => (
        <section key={activityIndex} style={{ marginBottom: 30 }}>
          <h2 className={"py-2 w-full font-bold text-bc-bg-blue mb-4"}>
            {activityItem.activity}
          </h2>
          {Object.entries(activityItem.source_types).map(
            ([sourceTypeName, sourceTypeValue], sourceTypeIndex) => {
              if (sourceTypeName.toLowerCase().includes("fuels")) {
                return (
                  <div key={sourceTypeIndex} style={styles.dataCard}>
                    {Object.entries(sourceTypeValue).map(([key, value]) => {
                      if (
                        key.toLowerCase() === "fuel name" ||
                        key.toLowerCase() === "fuel unit"
                      ) {
                        return (
                          <div key={key} style={{ marginBottom: 4 }}>
                            <strong>
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (s) => s.toUpperCase())}
                            </strong>
                            {`: ${String(value)}`}
                          </div>
                        );
                      }
                      return null;
                    })}
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
                        ? renderObject(sourceTypeValue)
                        : String(sourceTypeValue)}
                    </div>
                  }
                  readonly={false}
                />
              );
            },
          )}
        </section>
      ))}
    </div>
  );
}
