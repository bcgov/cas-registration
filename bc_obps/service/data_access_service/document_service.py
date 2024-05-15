from registration.models import Document, DocumentType


class DocumentDataAccessService:
    @classmethod
    def create_statutory_declaration(cls, user_guid, statutory_declaration):
        document = Document.objects.create(
            file=statutory_declaration,
            type=DocumentType.objects.get(name="signed_statutory_declaration"),
            created_by_id=user_guid,
        )

        return document
