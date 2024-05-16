from registration.models import Document, DocumentType


class DocumentDataAccessService:
    @classmethod
    def create_document(cls, user_guid, file_data, document_type_name):
        document = Document.objects.create(
            file=file_data,
            type=DocumentType.objects.get(name=document_type_name),
            created_by_id=user_guid,
        )

        return document
