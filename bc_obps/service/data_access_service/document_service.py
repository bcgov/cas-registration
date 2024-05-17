from typing import Optional
from uuid import UUID
from registration.models import Document, DocumentType
from django.core.files.base import ContentFile


class DocumentDataAccessService:
    @classmethod
    def create_document(cls, user_guid: UUID, file_data: Optional[ContentFile], document_type_name: str) -> Document:
        document = Document.objects.create(
            file=file_data,
            type=DocumentType.objects.get(name=document_type_name),
            created_by_id=user_guid,
        )

        return document
