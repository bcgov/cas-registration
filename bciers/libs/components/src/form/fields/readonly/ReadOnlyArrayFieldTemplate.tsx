import { ArrayFieldTemplateProps, FieldTemplateProps } from "@rjsf/utils";

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

const ReadOnlyArrayFieldTemplate = ({
  items,
  uiSchema,
}: ArrayFieldTemplateProps) => {
  const customTitleName = uiSchema?.["ui:options"]?.title as string;

  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item, i: number) => {
        return (
          <div key={item.key} className="min-w-full">
            <div className="text-bc-bg-blue text-lg flex justify-between m-w-full my-10">
              {customTitleName && (
                <span>
                  {customTitleName} {i + 1}
                </span>
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
    </div>
  );
};

export default ReadOnlyArrayFieldTemplate;
