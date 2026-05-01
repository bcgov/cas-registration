import Button from "@mui/material/Button";
import {
  ArrayFieldItemTemplateProps,
  ArrayFieldTemplateProps,
  FieldTemplateProps,
  getUiOptions,
} from "@rjsf/utils";

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

export function ArrayFieldItemTemplate(props: ArrayFieldItemTemplateProps) {
  const { buttonsProps, itemKey, uiSchema, registry, children, index } = props;
  const { canDeleteFirst = false } = getUiOptions(
    uiSchema,
    registry.globalUiOptions,
  );

  const customTitleName = uiSchema?.["ui:options"]?.title as string;
  const customItemName = uiSchema?.["ui:options"]?.customItemName as boolean;
  const formData = (children as any).props.formData;

  return (
    <div key={itemKey} className="flex min-w-full flex-col rjsf-array-item">
      {customItemName && formData?.name && (
        <div className="py-2 w-full font-bold text-bc-bg-blue mb-4">
          <span>{formData.name}</span>
        </div>
      )}
      {(customTitleName || (buttonsProps.hasRemove && index !== 0)) &&
        !customItemName && (
          <div className="text-bc-bg-blue text-lg flex align-center my-10">
            {customTitleName && (
              <span>
                {customTitleName} {index + 1}
              </span>
            )}
            {((buttonsProps.hasRemove && index !== 0) || canDeleteFirst) && (
              <button
                onClick={buttonsProps.onRemoveItem}
                className="border-none bg-transparent p-0 ml-6"
                title="Remove item"
                aria-label="Remove item"
              >
                <MinusSVG />
              </button>
            )}
          </div>
        )}
      {{
        ...children,
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
  );
}

export function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const { items, canAdd, onAddClick, disabled, readonly, uiSchema, registry } =
    props;
  const note = uiSchema?.["ui:options"]?.note as string;

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
          {arrayAddLabel}
        </Button>
      )}
      {note && (
        <div className="w-full px-[14px] py-4 items-center">
          <b>Note:</b> {note}
        </div>
      )}
    </div>
  );
}
