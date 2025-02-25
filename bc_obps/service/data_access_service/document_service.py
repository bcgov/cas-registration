from typing import Optional
from uuid import UUID
from ninja import UploadedFile
from registration.models import Document, DocumentType
from django.core.files.base import ContentFile
from reporting.constants import MAX_UPLOAD_SIZE
from ninja import UploadedFile
from pydantic import ValidationError
from reporting.constants import MAX_UPLOAD_SIZE


class DocumentDataAccessService:
    @classmethod
    def get_operation_document_by_type(cls, operation_id: UUID, document_type: str) -> Document | None:
        try:
            document = Document.objects.get(
                operation_id=operation_id, type=DocumentType.objects.get(name=document_type)
            )
        except Document.DoesNotExist:
            return None
        return document

    @classmethod
    def create_document(
         cls,
        operation_id: UUID,
        type: str,
        file: UploadedFile,
    ) -> Document:
        if file.size and file.size > MAX_UPLOAD_SIZE:
            raise ValidationError(f"File document cannot exceed {MAX_UPLOAD_SIZE} bytes.")

        document = Document(
            operation_id=operation_id,
            file=file,
            type=DocumentType.objects.get(name=type),
        )
        document.save()

        return document
