from typing import Optional
from uuid import UUID
from ninja import UploadedFile
from pydantic import ValidationError
from reporting.constants import MAX_UPLOAD_SIZE
from service.data_access_service.operation_service import OperationDataAccessService
from registration.models import Document, DocumentType
from django.core.files.base import ContentFile


class DocumentDataAccessServiceV2:
    @classmethod
    def get_operation_document_by_type(cls, operation_id: UUID, document_type: str) -> Document | None:
        operation = OperationDataAccessService.get_by_id(operation_id=operation_id)

        try:
            document = operation.documents.get(type=DocumentType.objects.get(name=document_type))
        except Document.DoesNotExist:
            return None

        return document

    @classmethod
    def create_document(
        cls, user_guid: UUID, file_data: Optional[ContentFile], document_type_name: str, operation_id: UUID
    ) -> Document:
        document = Document.objects.create(
            file=file_data,
            type=DocumentType.objects.get(name=document_type_name),
            created_by_id=user_guid,
            operation_id=operation_id,
        )

        return document

    @classmethod
    def create_document(
        cls,
        operation_id: UUID,
        type: str,
        file: UploadedFile,
    ) -> None:

        if file.size and file.size > MAX_UPLOAD_SIZE:
            raise ValidationError(f"File document cannot exceed {MAX_UPLOAD_SIZE} bytes.")

        document = Document(
            operation_id=operation_id,
            file=file,
            type=DocumentType.objects.get(name=type),
        )
        document.save()
        return document
