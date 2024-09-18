"use client";

import { ArrayFieldTemplateProps, FieldTemplateProps } from "@rjsf/utils";

function BasicFieldTemplate({ children }: FieldTemplateProps) {
  return <>{children}</>;
}

const PlacesAssignedArrayFieldTemplate = ({
  items,
}: ArrayFieldTemplateProps) => {
  return (
    <div>
      {items?.map((item) => {
        return (
          <div key={item.key} className="min-w-full">
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
      <div className="w-full px-[14px] py-4 items-center">
        <b>Note:</b> You cannot delete this contact unless you replace them with
        other contact(s) in the place(s) above.
      </div>
    </div>
  );
};

export default PlacesAssignedArrayFieldTemplate;
