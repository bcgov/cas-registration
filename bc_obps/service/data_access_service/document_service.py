from typing import Optional
from uuid import UUID
from common.lib import pgtrigger
from registration.models import Document, DocumentType
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


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
        cls, user_guid: UUID, file_data: Optional[ContentFile], document_type_name: str, operation_id: UUID
    ) -> Document:
        document = Document.objects.create(
            file=file_data,
            type=DocumentType.objects.get(name=document_type_name),
            created_by_id=user_guid,
            operation_id=operation_id,
            status=Document.FileStatus.UNSCANNED,
        )

        return document

    @classmethod
    def check_document_file_status(cls, document: Document) -> Document.FileStatus:
        file_name = document.file.name

        file_bucket = default_storage.get_file_bucket(file_name)  # type: ignore
        if file_bucket:
            if file_bucket == "Quarantined":
                document.status = Document.FileStatus.QUARANTINED
            elif file_bucket == "Clean":
                document.status = Document.FileStatus.CLEAN
            else:
                return Document.FileStatus.UNSCANNED
        else:
            raise FileNotFoundError(f"File {file_name} not found in storage.")

        # Ignore the audit columns triggers, we're not changing anything about the document itself
        with pgtrigger.ignore("registration.Document:set_updated_audit_columns"):
            document.save()
        return document.status
