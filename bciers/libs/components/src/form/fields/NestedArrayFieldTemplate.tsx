import Button from "@mui/material/Button";
import { ArrayFieldTemplateProps, FieldTemplateProps } from "@rjsf/utils";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

const NestedArrayFieldTemplate = ({
  canAdd,
  disabled,
  items,
  onAddClick,
  uiSchema,
}: ArrayFieldTemplateProps) => {
  const arrayAddLabel =
    (uiSchema?.["ui:options"]?.arrayAddLabel as string) || "Add";

  const customTitleName = uiSchema?.["ui:options"]?.title as string;
  const padding = uiSchema?.["ui:options"]?.padding;

  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item, i: number) => {
        return (
          <>
          <div style={{display: "block", marginTop: "1rem", marginBottom: "1rem", marginLeft: "1rem", marginRight: "1rem"}} />
          <div key={item.key} className={`min-w-full bg-[#f2f2f2] rounded-md ${padding}`}>
              {customTitleName && (
                <span className='emission-array-header'>
                  {customTitleName} {i + 1}
                </span>
              )}
              {i !== 0 && (
                <button
                  onClick={item.onDropIndexClick(item.index)}
                  className="border-none bg-transparent"
                  aria-label="Remove item"
                >
                  <DeleteForeverOutlinedIcon/>
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
                    label: false
                  },
                },
              },
            }}
          </div>
          </>

        );
      })}
      {canAdd && !disabled && (
        <Button
          disabled={disabled}
          variant="contained"
          className="w-fit my-8 normal-case"
          onClick={onAddClick}
        >
          {arrayAddLabel}
        </Button>
      )}
    </div>
  );
};

export default NestedArrayFieldTemplate;
