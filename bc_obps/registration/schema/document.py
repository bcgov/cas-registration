from registration.models.document import Document


def resolve_document(document: Document | None) -> str | None:
    if document is not None:
        return str(document.file.url)
    return None
