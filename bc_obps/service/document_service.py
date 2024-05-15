from typing import Optional
from uuid import UUID
from registration.models import Document, DocumentType, Operation
from service.data_access_service.operation_service import OperationDataAccessService


class DocumentService:
    @classmethod
    def get_existing_statutory_declaration_by_operation_id(cls, operation_id: UUID) -> Optional[Document]:
        operation: Operation = OperationDataAccessService.get_by_id(operation_id)
        return operation.documents.filter(type=DocumentType.objects.get(name="signed_statutory_declaration")).first()
