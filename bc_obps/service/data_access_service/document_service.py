from typing import Optional
from uuid import UUID
from registration.models import Document, DocumentType
from django.core.files.base import ContentFile
from bc_obps.storage_backends import (
    CleanBucketStorage,
    QuarantinedBucketStorage,
)


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

        clean_storage = CleanBucketStorage()
        quarnatined_storage = QuarantinedBucketStorage()

        if clean_storage.exists(file_name):
            document.status = Document.FileStatus.CLEAN
        elif quarnatined_storage.exists(file_name):
            document.status = Document.FileStatus.QUARANTINED
        else:
            # The file is not in any of the quarantined or clean buckets
            return Document.FileStatus.UNSCANNED

        document.save()
        return document.status
