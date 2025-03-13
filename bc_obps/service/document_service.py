from uuid import UUID
from ninja import UploadedFile
from service.data_access_service.document_service import DocumentDataAccessService
from registration.models import Document, Operation
from service.data_access_service.operation_service import OperationDataAccessService


class DocumentService:
    @classmethod
    def get_operation_document_by_type_if_authorized(
        cls, user_guid: UUID, operation_id: UUID, document_type: str
    ) -> Document | None:
        from service.operation_service import OperationService

        OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        return DocumentDataAccessService.get_operation_document_by_type(operation_id, document_type)

    @classmethod
    def create_or_replace_operation_document(cls, operation_id: UUID, file: UploadedFile, type: str) -> Document | None:
        """
        This function receives a document and operation id.
        Operations only have one of each type of document, so this function uses the type to check if an existing document needs to be replaced, or if no document exists and one must be created.
        This function does NOT set any m2m relationships.

        """
        existing_document = DocumentDataAccessService.get_operation_document_by_type(operation_id, type)
        # if there is an existing  document, delete it
        if existing_document:
            existing_document.delete()

        # create the new document
        document = DocumentDataAccessService.create_document(
            operation_id=operation_id,
            type=type,
            file=file,
        )
        return document

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
