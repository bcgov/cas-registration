from service.data_access_service.document_service import DocumentDataAccessService
from registration.utils import data_url_to_file
from registration.models.document import Document
from registration.tests.constants import MOCK_DATA_URL, MOCK_DATA_URL_2
from service.document_service import DocumentService
import pytest

from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestDocumentService:
    @staticmethod
    def test_create_operation_document():
        # the value received by the service is a File (transformed into this in the django ninja schema)
        file = data_url_to_file(MOCK_DATA_URL)
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        document, created = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, file, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert document.type.name == 'boundary_map'
        assert created is True

    @staticmethod
    def test_do_not_update_duplicate_operation_document():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        existing_document = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'boundary_map'
        )
        operation.documents.set([existing_document.id])
        created_at = operation.documents.first().created_at

        updated_file = data_url_to_file(MOCK_DATA_URL)
        document, created = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, updated_file, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert document.type.name == 'boundary_map'
        # MOCK_DATA_URL's filename is mock.pdf. When adding files to django, the name is appended, so we just check that 'mock' in the name
        assert document.file.name.find("mock") != -1
        assert document.created_at == created_at
        assert created is False

    @staticmethod
    def test_update_operation_document():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        existing_document = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'boundary_map'
        )
        operation.documents.set([existing_document.id])

        updated_file = data_url_to_file(MOCK_DATA_URL_2)
        document, created = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, updated_file, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert document.type.name == 'boundary_map'
        # MOCK_DATA_URL's filename is test.pdf
        assert document.file.name.find("test") != -1
        assert created is True

    @staticmethod
    def test_get_active_documents():
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        b_map = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'boundary_map'
        )
        pfd = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'process_flow_diagram'
        )
        nea = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'new_entrant_application'
        )
        operation.documents.set([b_map.id, pfd.id, nea.id])

        assert Document.objects.count() == 3

        DocumentService.archive_operation_document(
            approved_user_operator.user_id, operation.id, 'new_entrant_application'
        )

        assert Document.objects.count() == 2
        assert DocumentDataAccessService.get_active_operation_documents(operation.id).count() == 2
