# File uploads in BCIERS app

Could use some optimization: https://github.com/bcgov/cas-registration/issues/2123

Two methods are available:

- with RJSF
- without RJSF using `FormData`

## With RJSF (using data-urls)

### Frontend

- RJSF supports file with data-urls: https://rjsf-team.github.io/react-jsonschema-form/docs/usage/widgets/#file-widgets
- `FileWidget`: this started as a copy/paste from RJSF's [FileWidget](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/widgets/FileWidget.tsx) and @marcelmueller did some styling to match the designs. It now additionally includes a check for max file size, and possibly other stuff including state mgt.

In the rjsf schema:

```ts
# schema
statutory_declaration: {
  type: "string",
  title: "Statutory Declaration",
  format: "data-url",
}

# uiSchema
statutory_declaration: {
  "ui:widget": "FileWidget",
  "ui:options": {
    filePreview: true,
    accept: ".pdf",
  }
}
```

### Backend

#### Ninja field validator

The field is declared as a string, and we validate that we can convert it to a file

`In` schema:

```python
...
  boundary_map: str

  @field_validator("boundary_map")
  @classmethod
  def validate_boundary_map(cls, value: str) -> ContentFile:
    return data_url_to_file(value)
```

The reverse can be done for the `Out` schema if needed:

```python
  boundary_map: Optional[str] = None

  @staticmethod
  def resolve_boundary_map(obj: Operation) -> Optional[str]:
    boundary_map = obj.get_boundary_map()
    if boundary_map:
      return file_to_data_url(boundary_map)

    return None
```

#### Service

```python
  DocumentService.create_or_replace_operation_document(
    user_guid,
    operation.id,
    payload.boundary_map, # type: ignore # mypy is not aware of the schema validator
    'boundary_map',
  ),
```

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
