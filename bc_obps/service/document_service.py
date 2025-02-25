from typing import Optional, Tuple
from uuid import UUID
from service.data_access_service.document_service import DocumentDataAccessService
from registration.models import Document, DocumentType, Operation
from service.data_access_service.operation_service import OperationDataAccessService
from django.core.files.base import ContentFile


class DocumentService:
    @classmethod
    def get_existing_statutory_declaration_by_operation_id(cls, operation_id: UUID) -> Optional[Document]:
        operation: Operation = OperationDataAccessService.get_by_id(operation_id)
        return operation.documents.filter(type=DocumentType.objects.get(name="signed_statutory_declaration")).first()

    @classmethod
    def create_or_replace_operation_document(
        cls, user_guid: UUID, operation_id: UUID, file_data: ContentFile, document_type: str
    ) -> Tuple[Document, bool]:
        """
        This function receives a document and operation id.
        Operations only have one of each type of document, so this function uses the type to check if an existing document needs to be replaced, or if no document exists and one must be created.
        This function does NOT set any m2m relationships.
        :returns: Tuple[Document, bool] where the bool is True if a new document was created, False if an existing document was updated
        """
        existing_document = DocumentDataAccessService.get_operation_document_by_type(operation_id, document_type)
        # if there is an existing  document, delete it
        if existing_document:
            existing_document.delete()

        document = DocumentDataAccessService.create_document(user_guid, file_data, document_type)
        return document, True

    @classmethod
    def archive_or_delete_operation_document(cls, user_guid: UUID, operation_id: UUID, document_type: str) -> bool:
        """
        This function receives an operation ID and document type.
        If the operation's status != "Registered", the specified document will be deleted.
        If the operation's status == "Registered", and the specified document_type for the operation_id can be found, this
        function will archive that document.
        :returns: bool to indicate whether the document was successfully archived or deleted.
        """
        operation = OperationDataAccessService.get_by_id(operation_id)
        document = DocumentDataAccessService.get_operation_document_by_type(operation_id, document_type)
        if document and operation.status == Operation.Statuses.REGISTERED:
            document.set_archive(user_guid)
            return True
        elif document:
            document.delete()
            return True
        return False
