from typing import Tuple
from uuid import UUID
from service.data_access_service.document_service_v2 import DocumentDataAccessServiceV2
from service.data_access_service.document_service import DocumentDataAccessService
from registration.models import Document
from registration.utils import files_have_same_hash
from django.core.files.base import ContentFile


class DocumentServiceV2:
    @classmethod
    def get_operation_document_by_type_if_authorized(
        cls, user_guid: UUID, operation_id: UUID, document_type: str
    ) -> Document | None:
        from service.operation_service_v2 import OperationServiceV2

        OperationServiceV2.get_if_authorized_v2(user_guid, operation_id, ['id', 'operator_id'])
        return DocumentDataAccessService.get_operation_document_by_type(operation_id, document_type)

    @classmethod
    def create_or_replace_operation_document(
        cls, user_guid: UUID, operation_id: UUID, file_data: ContentFile, document_type: str
    ) -> Tuple[Document, bool]:
        """
        This function receives a document and operation id.
        Operations only have one of each type of document, so this function uses the type to check if an existing document needs to be replaced, or if no document exists and one must be created.
        This function does NOT set any m2m relationships.
        :returns:c Tuple[Document, bool] where the bool is True if a new document was created, False if an existing document was updated
        """
        # brianna the main backend file stuff is here
        existing_document = cls.get_operation_document_by_type_if_authorized(user_guid, operation_id, document_type)
        # if there is an existing  document, check if the new one is different
        if existing_document:
            # We need to check if the file has changed, if it has, we need to delete the old one and create a new one
            if not files_have_same_hash(file_data, existing_document.file):
                existing_document.delete()
            else:
                return existing_document, False
        # if there is no existing document, create a new one
        document = DocumentDataAccessServiceV2.create_document(user_guid, file_data, document_type, operation_id)
        return document, True
