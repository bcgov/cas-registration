from typing import Optional
from uuid import UUID
from common.lib import pgtrigger
from registration.models import Document, DocumentType
from django.core.files.base import ContentFile
from django.core.files.storage import storages


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

        clean_storage = storages["clean"]
        quarnatined_storage = storages["quarantined"]

        if clean_storage.exists(file_name):
            document.status = Document.FileStatus.CLEAN
        elif quarnatined_storage.exists(file_name):
            document.status = Document.FileStatus.QUARANTINED
        else:
            # The file is not in any of the quarantined or clean buckets
            return Document.FileStatus.UNSCANNED

        # Ignore the audit columns triggers, we're not changing anything about the document itself
        with pgtrigger.ignore("registration.Document:set_updated_audit_columns"):
            document.save()
        return document.status
