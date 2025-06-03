import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { FC } from "react";
import { WidgetProps } from "@rjsf/utils";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";

export const readOnlyStringField = (
  title: string = "",
): {
  type: "string";
  title: string;
  readOnly: boolean;
} => ({
  type: "string",
  title,
  readOnly: true,
});

export const readOnlyObjectField = (
  title: string = "",
): {
  type: "object";
  title: string;
  readOnly: boolean;
} => ({
  type: "object",
  title,
  readOnly: true,
});

export const commonReadOnlyOptions: {
  "ui:widget": FC<WidgetProps>;
  "ui:classNames": string;
} = {
  "ui:widget": ReadOnlyWidget,
  // Override the default class names for the read-only widget
  "ui:classNames":
    "[&>div:nth-child(2)]:w-fit [&_.read-only-widget]:p-0 [&_.read-only-widget]:min-h-0 [&>div>label]:font-normal ",
};

export const headerUiConfig = {
  "ui:classNames": "text-bc-bg-blue mt-8 mb-2",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

export const tco2eUiConfig = {
  ...commonReadOnlyOptions,
  "ui:options": {
    suffix: "\u00A0tCO2e",
  },
};

export const currencyUiConfig = {
  ...commonReadOnlyOptions,
  "ui:options": {
    prefix: "$",
  },
};
