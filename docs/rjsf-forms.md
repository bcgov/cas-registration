# RJSF form setup and customization

RJSF Documentation: [https://rjsf-team.github.io/react-jsonschema-form/docs/](https://rjsf-team.github.io/react-jsonschema-form/docs/)

## Types

Number fields will be automatically handled when the type is set to `number` in the schema as the default `TextWidget` will change the input to a number input and save the value as a number. This can be overridden using the `ui:widget` option in the `uiSchema`.

```
number_field {
  type: 'number',
  title: 'Number field'
}
```

## Custom validation

To create custom validation for a field, in `FormBase`, add your format to the `customFormats` object. e.g.:

```
const customFormats = {
  bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
};
```

Then, in the form schema, add `format: <customFormats key`> to the relevant field. e.g.

```
bc_corporate_registry_number: { type: "string", title: "title", format: "bc_corporate_registry_number" }
```

#### List of formats

##### Custom

- `phone` - Canadian/US formatted phone number: `+12345678901`
- `bc_corporate_registry_number` - 3 letters, 7 numbers: `abc1234567`
- `postal-code` - Canadian postal code format: A1A 1A1

##### RJSF defaults

- `uri` - URL format: http://www.website.com, https://www.website.com
- `email` - Standard email format: email@address.com

## Custom widgets

The `defaultTheme` includes many custom widgets which can be set in the forms `uiSchema` using the `ui:widget` option.

### Phone widget

To enable the phone widget set the widget type in the forms `uiSchema`:

```
phone_field {
  'ui:widget': 'PhoneWidget'
}
```

To enable validation of the phone widget the format must be set to `format: phone` in the form schema:

```
phone_field {
  type: 'string',
  format: 'phone',
  title: 'Phone field'
}
```

### Multi select widget

A select widget using MUI Autocomplete for fields with `type: array` to store multiple values. To enable the `MultiSelectWidget` set the widget type in the `uiSchema`:

```
multiselect_field {
 'ui:widget': 'MultiSelectWidget'
}
```

An `enum` array is required in the array `items` section to set the available values. An optional `enumNames` array can be set if alternative option labels is required.

```
multiselect_field {
  type: "array",
  items: {
    type: "string",
    enum: ["one", "two", "three"]
    // enumNames is optional
    enumNames: ["Option 1", "Option 2", "Option 3"]
  },
  title: "MultiSelect field",
}
```

### Postal code widget

A widget for 6 character Canadian postal code format. To enable the postal code widget set the widget type in the forms `uiSchema`:

```
postal_code_field {
  'ui:widget': 'PostalCodeWidget'
}
```

To enable validation of the postal code widget the format must be set to `format: 'postal-code'` in the form schema:

```
  postal_code_field {
    type: 'string',
    format: 'postal-code',
    title: 'Postal codefield'
  }
```

### Checkbox widget

A checkbox widget for `boolean` type fields. Set the `ui:widget` to `CheckboxWidget` in the fields `uiSchema`

To ensure the label doesn't display twice using the default `InlineFieldTemplate` set `label: false` in `ui:options`.

```
checkbox_field {
  "ui:widget": "CheckboxWidget",
  "ui:options": {
      label: false,
  }
}
```
