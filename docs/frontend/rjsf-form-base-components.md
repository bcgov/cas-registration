## Custom FormBase components

### SingleStepTaskListForm

A form component that accepts a 'multi-section' form schema like we previously used in the `MultiStepFormBase` for multi page forms. The key difference is that the form data will be split into sections unlike a multi page form which splits the form data into a flat object for each page. Note: while the schema contains section, the formData itself should be a flat object. The single step form contains logic to transform flat data into sectioned data.

Example schema:

```
const schema: RJSFSchema = {
  type: "object",
  properties: {
    section1: {
      type: "object",
      properties: {
        field1: { type: "string", title: "Field 1" },
        field2: { type: "string", title: "Field 2" },
      },
    },
    section2: {
      type: "object",
      properties: {
        field3: { type: "string", title: "Field 3" },
        field4: { type: "string", title: "Field 4" },
      },
    },
  },
};
```

The formData will be returned as:

```
{
    field1: "value",
    field2: "value",
    field3: "value",
    field4: "value",
}
```

The uiSchema will be the same as a normal uiSchema but nested into sections.

To keep with the intended design of the form, the `ui:FieldTemplate` should be set to `SectionFieldTemplate` for each section including the root object. This has to be manually done because the default `FieldTemplate` for each field is the `InlineFieldTemplate`.

```
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";

const uiSchema: RJSFUISchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
    field1: {
      "ui:widget": "TextWidget",
    },
    field2: {
      "ui:widget": "TextWidget",
    },
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    field3: {
      "ui:widget": "TextWidget",
    },
    field4: {
      "ui:widget": "TextWidget",
    },
  },
};
```

#### Props

disabled: accepts a boolean to disable the form<br/>
formData: accepts a flat object<br/>
schema: accepts an RJSFSchema object<br/>
uiSchema: accepts a UiSchema object<br/>
onCancel: accepts a function that will be called when the cancel button is clicked<br/>
onSubmit: accepts a function that will be called when the form is submitted<br/>

#### Example usage:

```
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";

...

return (
  <SingleStepTaskListForm
    schema={schema}
    uiSchema={uiSchema}
    formData={{}}
    onSubmit={async (data) => console.log(data)}
    onCancel={() => console.log("cancelled")}
  />
)
```
