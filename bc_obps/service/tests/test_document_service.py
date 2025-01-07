from service.data_access_service.document_service import DocumentDataAccessService
from registration.utils import data_url_to_file
from registration.models.document import Document
from registration.models.operation import Operation
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

    @pytest.mark.parametrize("registration_status", [Operation.Statuses.REGISTERED, Operation.Statuses.DRAFT])
    def test_archive_or_delete_operation_document(self, registration_status):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        operation = baker.make_recipe(
            'utils.operation', operator=approved_user_operator.operator, status=registration_status
        )
        b_map = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'boundary_map'
        )
        pfd = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, data_url_to_file(MOCK_DATA_URL), 'process_flow_diagram'
        )
        operation.documents.set([b_map.id, pfd.id])

        assert Document.objects.count() == 2
        assert operation.documents.count() == 2

        DocumentService.archive_or_delete_operation_document(
            approved_user_operator.user_id, operation.id, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert operation.documents.count() == 1

        if registration_status == Operation.Statuses.REGISTERED:
            """if the registration has been completed, the document should be archived"""
            print(b_map.file)
            print(b_map.archived_at, b_map.archived_by)
            assert b_map.archived_at is not None
            assert b_map.archived_by is not None
        elif registration_status == Operation.Statuses.DRAFT:
            """if the registration wasn't completed, the document should be deleted"""
            print(b_map.file)
            assert b_map is None
