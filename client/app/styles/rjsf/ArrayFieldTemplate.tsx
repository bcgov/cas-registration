import Button from "@mui/material/Button";
import { ArrayFieldTemplateProps, FieldTemplateProps } from "@rjsf/utils";

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const { canAdd, items, onAddClick } = props;
  /* item.onDropIndexClick(item.index) */
  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item, i: number) => {
        return (
          <div key={item.key} className="min-w-full">
            <div className="form-heading m-w-full">
              Multiple Operator(s) information - Operator {i + 1}
            </div>
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
        );
      })}

      {canAdd && (
        <Button variant="contained" className="w-fit" onClick={onAddClick}>
          Add
        </Button>
      )}
    </div>
  );
};

export default ArrayFieldTemplate;
