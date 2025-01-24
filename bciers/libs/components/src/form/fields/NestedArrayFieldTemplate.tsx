import Button from "@mui/material/Button";
import { ArrayFieldTemplateProps, FieldTemplateProps } from "@rjsf/utils";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import AddIcon from "@mui/icons-material/Add";
import { BC_GOV_BACKGROUND_COLOR_GREY } from "@bciers/styles";

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

const NestedArrayFieldTemplate = ({
  canAdd,
  disabled,
  items,
  onAddClick,
  uiSchema,
  readonly,
}: ArrayFieldTemplateProps) => {
  const arrayAddLabel =
    (uiSchema?.["ui:options"]?.arrayAddLabel as string) || "Add";

  const customTitleName = uiSchema?.["ui:options"]?.title as string;
  const bgColor = (uiSchema?.["ui:options"]?.bgColor as string) || "#f2f2f2";
  const showHr = uiSchema?.["ui:options"]?.showHr ?? false;
  const padding = uiSchema?.["ui:options"]?.padding;
  const verticalBorder = uiSchema?.["ui:options"]?.verticalBorder
    ? {
        borderLeft: "6px solid #003366",
        marginLeft: "1rem",
        paddingLeft: "1rem",
        height: "50%",
        backgroundColor: "transparent",
      }
    : {};

  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item, i: number) => {
        return (
          <div key={item.key}>
            <div
              style={{
                display: "block",
                marginTop: "1rem",
                marginBottom: "1rem",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            />
            <div
              style={{
                ...verticalBorder,
                backgroundColor: bgColor,
              }}
              className={`min-w-full rounded-md ${padding}`}
            >
              {customTitleName && (
                <span className="emission-array-header">
                  {customTitleName} {i + 1}
                </span>
              )}
              {i !== 0 && (
                <button
                  onClick={item.onDropIndexClick(item.index)}
                  className="border-none bg-transparent"
                  aria-label="Remove item"
                >
                  <DeleteForeverOutlinedIcon />
                </button>
              )}
              {{
                ...item.children,
                props: {
                  ...item.children.props,
                  uiSchema: {
                    ...item.children.props.uiSchema,
                    "ui:FieldTemplate": BasicFieldTemplate,
                    "ui:options": {
                      label: false,
                    },
                  },
                },
              }}
            </div>
            {showHr && (
              <hr
                style={{ color: BC_GOV_BACKGROUND_COLOR_GREY, margin: "1px 0" }}
              />
            )}
          </div>
        );
      })}
      {canAdd && !disabled && !readonly && (
        <Button
          disabled={disabled}
          variant="outlined"
          className="w-fit my-8 normal-case"
          onClick={onAddClick}
          sx={{ p: 1, pt: 0, pb: 0 }}
        >
          <AddIcon />
          &nbsp;{arrayAddLabel}
        </Button>
      )}
    </div>
  );
};

export default NestedArrayFieldTemplate;
