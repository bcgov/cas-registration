# File uploads in BCIERS app

Two methods are available:

- with RJSF
- without RJSF using `FormData`

#### Model

The `FileField` is where django does the magic, along with the `STORAGES` configuration in settings.py.
More documentation [here](https://docs.djangoproject.com/en/5.1/ref/models/fields/#filefield)

```python
  class Document(TimeStampedModel):
    file = models.FileField(upload_to="documents", db_comment="The file format, metadata, etc.")
```

#### Connection with GCS

- Some setup is done in cas-registration/bc_obps/bc_obps/settings.py, will need env variables
- GCS is not set up in CI so we skip endpoint tests related to files, and we don't have any file stuff in our mock data

## With RJSF

Because files can be large and slow to process, we only pass the file from the front end to the back end when the user first uploads it. We never pass the file itself from back to front; instead we pass a url where the user can download it.

### Frontend

We send files to the backend using FormData. Because RJSF stores data as json, in the handleSubmit, we have to convert to FormData (see `convertRjsfFormData` from "@/registration/app/components/operations/registration/OperationInformationForm"). The conversion happens in the form component (e.g. `OperationInformationForm`). The `FileWidget` handles previewing and downloading the file, and additionally includes a check for max file size.

In the rjsf schema:

```ts
# schema
statutory_declaration: {
  type: "string",
  title: "Statutory Declaration",
}

# uiSchema
statutory_declaration: {
  "ui:widget": "FileWidget",
  "ui:options": {
    accept: ".pdf",
  }
}
```

### Backend

#### Endpoints

To make django ninja happy, we have to separate out form data and file data. There are a few ways to do this, see the docs, and we've chosen to go with this for a POST endpoint:

```python
def update_operation(
    request: HttpRequest, operation_id: UUID,
    details: Form[OperationAdministrationIn], # OperationAdministrationIn is a ModelSchema or Schema
    boundary_map: UploadedFile = File(None),
    process_flow_diagram: UploadedFile = File(None),
    new_entrant_application: UploadedFile = File(None)
)
```

Notes:

- File is always optional because if the user hasn't changed the file, we don't send anything.
- Django ninja doesn't support files on PUT, so we have to use POST for anything file-related

A GET endpoint requires a conversion from file to download link in the ninja schema:

`Out` schema:

```python
...
  class OutWithDocuments(ModelSchema):
    boundary_map: Optional[str] = None

    @staticmethod
    def resolve_boundary_map(obj: Operation) -> Optional[str]:
        return str(obj.get_boundary_map().file.url)
```

The `FileWidget` and `ReadOnlyFileWidget` can handle both File and string values.

#### Service

We have two services for file uploads:

- DocumentServiceV2.create_or_replace_operation_document
- DocumentDataAccessServiceV2.create_document

### Testing

We have mock files in both our FE and BE constants.

In vitests, we have to mock `createObjectURL`, which is used in the `FileWidget` (e.g. `global.URL.createObjectURL = vi.fn(() => "this is the link to download the File",);`).

We check mocked calls like this:

```
expect(actionHandler).toHaveBeenCalledWith(
          "registration/operations/b974a7fc-ff63-41aa-9d57-509ebe2553a4/registration/operation",
          "POST",
          "",
          { body: expect.any(FormData) },
        );
        const bodyFormData = actionHandler.mock.calls[1][3].body;
        expect(bodyFormData.get("registration_purpose")).toBe(
          "Reporting Operation",
        );
        expect(bodyFormData.getAll("activities")).toStrictEqual(["1", "2"]);
        ...
```

When using pytests, we have to mock payloads that include files like this (note the array []):

```python
mock_payload = {
        'registration_purpose': ['Reporting Operation'],
        'operation': ['556ceeb0-7e24-4d89-b639-61f625f82084'],
        'activities': ['31'],
        'name': ['Barbie'],
        'type': [Operation.Types.SFO],
        'naics_code_id': ['20'],
        'operation_has_multiple_operators': ['false'],
        'process_flow_diagram': ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
        'boundary_map': ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
    }
```

## Without RJSF

### Frontend

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

### Backend

#### API

Django-ninja [does this for us](https://django-ninja.dev/guides/input/file-params/)!

```python
@router.post(...)
def save_files(request: HttpRequest, files: List[UploadedFiles] = File(...)):
    ... here goes processing ...
```

#### Service & Model

Similar to above

#### Testing

`InMemoryUploadedFile` can be used to pass data to the field without it being saved anywhere
