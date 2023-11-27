import Button from "@mui/material/Button";
import { ArrayFieldTemplateProps, FieldTemplateProps } from "@rjsf/utils";

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

const MinusSVG = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.5273 2.38086H4.33984C3.0459 2.38086 1.99609 3.43066 1.99609 4.72461V21.9121C1.99609 23.2061 3.0459 24.2559 4.33984 24.2559H21.5273C22.8213 24.2559 23.8711 23.2061 23.8711 21.9121V4.72461C23.8711 3.43066 22.8213 2.38086 21.5273 2.38086ZM6.48828 15.2715C6.16602 15.2715 5.90234 15.0078 5.90234 14.6855V11.9512C5.90234 11.6289 6.16602 11.3652 6.48828 11.3652H19.3789C19.7012 11.3652 19.9648 11.6289 19.9648 11.9512V14.6855C19.9648 15.0078 19.7012 15.2715 19.3789 15.2715H6.48828Z"
      fill="#D8292F"
    />
  </svg>
);

const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const { canAdd, items, onAddClick } = props;
  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item, i: number) => {
        return (
          <div key={item.key} className="min-w-full">
            <div className="form-heading flex justify-between m-w-full">
              <span>Multiple Operator(s) information - Operator {i + 1}</span>
              {i !== 0 && (
                <button
                  onClick={item.onDropIndexClick(item.index)}
                  className="border-none bg-transparent p-0"
                >
                  <MinusSVG />
                </button>
              )}
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
