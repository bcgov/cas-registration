import React from "react";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";

const styles = {
  sourceCard: {
    backgroundColor: "white",
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  dataCard: {
    backgroundColor: "#f2f2f2",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "6px",
  },
};

const verticalBorder = {
  borderLeft: "6px solid #003366",
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

function renderObject(obj: unknown, labelPrefix = ""): React.ReactNode {
  if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      const title = labelPrefix ? `${labelPrefix} ${index + 1}:` : "";
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
    return Object.entries(obj).map(([key, value], idx) => (
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
          : String(value)}
      </div>
    ));
  }

  return <span>{String(obj)}</span>;
}

export default function ActivitiesView({ activity_data }: ActivitiesViewProps) {
  return (
    <div>
      {activity_data.map((activityItem, i) => (
        <section key={i} style={{ marginBottom: 30 }}>
          <h2 className={"py-2 w-full font-bold text-bc-bg-blue mb-4"}>
            {activityItem.activity}
          </h2>
          {Object.entries(activityItem.source_types)
            .sort(([keyA], [keyB]) => {
              if (keyA.toLowerCase().includes("emissions")) return 1;
              if (keyB.toLowerCase().includes("emissions")) return -1;
              return 0;
            })
            .map(([sourceTypeName, sourceTypeValue], j) => {
              if (sourceTypeName.toLowerCase().includes("fuels")) {
                return (
                  <div key={j} style={styles.dataCard}>
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
                  key={j}
                  classNames="source-type-box"
                  label={sourceTypeName}
                  description={
                    <div style={styles.dataCard}>
                      {typeof sourceTypeValue === "object"
                        ? renderObject(sourceTypeValue)
                        : String(sourceTypeValue)}
                    </div>
                  }
                  children={null}
                  help={null}
                  errors={null}
                  readonly={false}
                />
              );
            })}
        </section>
      ))}
    </div>
  );
}
