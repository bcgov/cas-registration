# RJSF form setup and customization

RJSF Documentation: [https://rjsf-team.github.io/react-jsonschema-form/docs/](https://rjsf-team.github.io/react-jsonschema-form/docs/)

## Custom widgets

The `defaultTheme` includes many custom widgets which can be set in the forms `uiSchema` using the `ui:widget` option.

### Phone widget

To enable the phone widget set the widget type in the forms `uiSchema`.

```
phone_field {
  'ui:widget': 'PhoneWidget'
}
```

To enable validation of the phone widget the format must be set to `format: phone` in the form schema

```
  phone_field {
    type: 'string',
    format: 'phone',
    title: 'Phone field'
  }
```
