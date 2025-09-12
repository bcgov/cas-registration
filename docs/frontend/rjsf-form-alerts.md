## Custom Alert component

### Principle

The common alert component works as a custom field template, allowing us to render custom alerts in the middle of an RJSF form.
It includes a factory to easily wrap complex components within an alert.

### Usage

1. Create a custom template with the help of the `AlertFieldTemplateFactory`
1. Add a custom property on the schema, and set the custom template for that property in the uiSchema
1. The custom template looks for a key named after the custom property in the `formContext` object.
   - To simply turn it on, set that custom property to `true`
   - To turn it off, set that custom property to `false`, or omit that property
   - To add props passed onto the custom template, set that custom property to an object with the relevant keys.

### Features

The AlertFieldTemplateFactory supports multiple levels of alerts, default being a blue background and a red warning icon.
Multiple default icons match the supplied alertType, but a custom icon can be provided.

```ts
function AlertFieldTemplateFactory<T>(
  AlertContent: React.FC<T>,
  alertType?: AlertType, // "INFO" | "ALERT" | "ERROR" | "DEFAULT"
  alertIcon?: ReactNode, // Set of default icons matching the alert type
);
```

### Example

```ts
const CustomAlertComponent = ({custom_prop: string}) => {
    return <div> ... some custom jsx component with {custom_prop} ...</div>
}

const CustomAlertFieldTemplate = AlertFieldTemplateFactory(CustomAlertComponent, "ALERT")


const schema = {
    // ...
    properties: {
        custom_alert {
            type: "object"
        }
        // ...
    }
}

const uiSchema = {
    // ...
    custom_alert: {
        "ui:FieldTemplate": CustomAlertFieldTemplate
    }
}

const FormComponent = () => {

    // ...

    return <Form
        schema={schema}
        uiSchema={uiSchema}
        formContext={
            custom_alert: {custom_prop: "test prop"} // or just `true` if no custom props are necessary
        }
    />

}
```
