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
    def set_document(
        cls,
        operation_id: UUID,
        user_guid: UUID,
        document_type: str,
        document_file: UploadedFile,
    ) -> None:

        if document_file.size and document_file.size > MAX_UPLOAD_SIZE:
            raise ValidationError(f"File document cannot exceed {MAX_UPLOAD_SIZE} bytes.")

        existing_document = cls.get_operation_document_by_type_if_authorized(user_guid, operation_id, document_type)
        # if there is an existing  document, delete it
        if existing_document:
            existing_document.delete()

        document = Document(
            operation_id=operation_id,
            file=document_file,
            document_type=document_type,
        )
        document.save()
        return document
