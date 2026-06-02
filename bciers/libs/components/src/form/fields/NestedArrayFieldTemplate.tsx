import {
  ArrayFieldItemTemplateProps,
  ArrayFieldTemplateProps,
  FieldTemplateProps,
} from "@rjsf/utils";
import Button from "@mui/material/Button";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import AddIcon from "@mui/icons-material/Add";
import { BC_GOV_BACKGROUND_COLOR_GREY } from "@bciers/styles";

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

export function NestedArrayFieldItemTemplate(
  props: ArrayFieldItemTemplateProps,
) {
  const { children, buttonsProps, parentUiSchema, readonly, index } = props;
  const customTitleName = parentUiSchema?.["ui:options"]?.title as string;
  const bgColor =
    (parentUiSchema?.["ui:options"]?.bgColor as string) || "#f2f2f2";
  const showSeparator = parentUiSchema?.["ui:options"]?.showSeparator ?? false;
  const padding = parentUiSchema?.["ui:options"]?.padding;
  const verticalBorder = parentUiSchema?.["ui:options"]?.verticalBorder;
  return (
    <div className="rjsf-array-item">
      <div
        style={{
          display: "block",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      />
      <div
        style={{
          marginLeft: verticalBorder ? "1rem" : "0",
        }}
      >
        <div
          style={{
            borderLeft: verticalBorder ? "6px solid #003366" : "none",
            backgroundColor: bgColor,
            paddingLeft: "1rem",
          }}
          className={`min-w-full rounded-md ${padding}`}
        >
          {customTitleName && (
            <span className="emission-array-header">
              {customTitleName} {index + 1}
            </span>
          )}
          {!readonly && (
            <button
              onClick={buttonsProps.onRemoveItem}
              className="border-none bg-transparent"
              aria-label="Remove item"
              type="button"
            >
              <DeleteForeverOutlinedIcon />
            </button>
          )}
          {{
            ...(children as any),
            props: {
              ...(children as any).props,
              uiSchema: {
                ...(children as any).props.uiSchema,
                "ui:FieldTemplate": BasicFieldTemplate,
                "ui:options": {
                  label: false,
                },
              },
            },
          }}
        </div>
        {showSeparator && (
          <hr
            style={{ color: BC_GOV_BACKGROUND_COLOR_GREY, margin: "1px 0" }}
          />
        )}
      </div>
    </div>
  );
}

export function NestedArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const { items, canAdd, onAddClick, disabled, readonly, uiSchema } = props;
  const arrayAddLabel =
    (uiSchema?.["ui:options"]?.arrayAddLabel as string) || "Add";
  return (
    <div className="array">
      {items}
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
}
