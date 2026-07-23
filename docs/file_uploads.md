# File uploads in BCIERS app

#### Connection with GCS

- Some setup is done in cas-registration/bc_obps/bc_obps/settings.py, will need env variables
- GCS is not set up in CI so we skip endpoint tests related to files, and we don't have any file stuff in our mock data

## With RJSF

### A frontend file widget that splits data and file content

example: [OperationInformationForm.tsx](../apps/registration/app/components/operations/registration/OperationInformationForm.tsx)

### Usage

The `FileWidget.tsx` exposes a hook that wraps the form submission, providing:

- A context object to pass to the form, to link file field with submitted data
  (it contains a callback to store the selected file within a closure, to submit along with the form)
- A `submitWithFiles` method wrapping the actionHandler method, building the FormData object and submitting it with the right mime types

The RJSF schema should expose the property as a `string`, the widget does the rest.

```ts

const schema: {
  "properties" : {
    "file_prop": {
      "type":"string"
    }
  }
}

const ComponentWithForm = (props) => {

  const [fileWidgetContext, submitWithFiles] = useFileUploadWidget();

  const handleSubmit = ({data}) => {
    const response = await submitWithFiles(
      data.formData,
      URL,
      "POST",
      pathToRevalidate
    )
  }

  return <Form
    schema={schema}
    formContext={{...otherContext, ...fileWidgetContext}
    onSubmit={handleSubmit}
  />

}

```

> [!NOTE]
> The `FileWidget` sets the string value to a serialized JSON string: '{"status": "Clean", "name": "FileName.pdf", "id": 1234}'
> The backend is expected to follow that schema when passing form data

### Backend considerations

- The payload will contain a serialized `{id: <id | undefined>, name: <name>, status: <"unscanned"|"clean"|...>}` object that will be part of the form data. Parsing that form data on the backend can be useful
- The `GET` API endpoint is expected to provide that same structure to the frontend form to display the initial file parameters, if a file is present already.

example ninja schema: [operation.py](../bc_obps/registration/schema/operation.py:19)

## Without RJSF

### Manual frontend handling

example: [AttachmentForm.tsx](../bciers/apps/reporting/src/app/components/attachments/AttachmentForm.tsx)

To submit a file, use the `File` object from an `<input type="file" ... />` element.

Then, the submit handler can build a `FormData` and add one (or more if multiple) files:

```ts
const formData = new FormData();

for (const file of files) {
  formData.append("files", file);
}

const response = await postAttachments(version_id, formData);
```

The `actionHandler` will automatically attach the proper `application/www-form-urlencoded` type to the request, there is no need to set this up.

## Backend

#### API

Django-ninja [does this for us](https://django-ninja.dev/guides/input/file-params/)!

```python
@router.post(...)
def save_files(request: HttpRequest, files: List[UploadedFiles] = File(...)):
    ... here goes processing ...
```

or for multiple files along with a payload

```python
@router.post(...)
def save_files(request: HttpRequest, payload: SomeSchema, my_file: File[UploadedFile], my_optional_file: File[UploadedFile] = None):
  ... stuff
```

[!Warning]: only POST requests are supported at this point by Django
[!Warning]: using the Optional[File] type breaks ninja

#### Service & Model

Similar to above

#### Testing

`InMemoryUploadedFile` can be used to pass data to the field without it being saved anywhere
