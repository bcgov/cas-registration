from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.models import Document
from registration.tests.constants import DOCUMENT_FIXTURE, TIMESTAMP_COMMON_FIELDS
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user
from model_bakery import baker


class DocumentModelTest(BaseTestCase):
    fixtures = [DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("file", "file", None, None),
            ("type", "type", None, None),
            ("description", "description", 1000, None),
            ("operation", "operation", None, None),
            ("status", "status", None, None),
        ]
        cls.test_object = Document.objects.get(id=1)


# RLS tests
class TestDocumentRls(BaseTestCase):
    def test_document_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        document = baker.make_recipe('registration.tests.utils.document', operation=operation)
        random_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=baker.make_recipe('registration.tests.utils.operator')
        )
        random_document = baker.make_recipe('registration.tests.utils.document', operation=random_operation)

        # confirm two documents were created
        assert Document.objects.count() == 2

        def select_function(cursor):
            assert Document.objects.count() == 1

        def insert_function(cursor):
            # own document - successful
            new_doc = Document.objects.create(file='test.pdf', type=document.type, operation=operation, status="Clean")
            assert Document.objects.filter(id=new_doc.id).exists()

            # someone else's document - fail. Using cursor because if we try via django, the error is that the random_operation's id does not exist
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "document'
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."document" (
                        file,
                        type_id,
                        operation_id,
                        status
                    ) VALUES (
                        %s,
                        %s,
                        %s,
                        %s
                    )
                """,
                    ('test.pdf', document.type.id, random_operation.id, "Clean"),
                )

        def update_function(cursor):
            Document.objects.update(description='description updated')
            assert Document.objects.filter(description='description updated').count() == 1  # only affected 1/2

        def delete_function(cursor):
            Document.objects.all().delete()
            assert Document.objects.count() == 1  # only deleted 1/2

        test_policies_for_industry_user(
            Document, approved_user_operator.user, select_function, insert_function, update_function, delete_function
        )

    def test_document_rls_cas_users(self):

        baker.make_recipe('registration.tests.utils.document', _quantity=5)

        def select_function(cursor):
            assert Document.objects.count() == 5

        def update_function(cursor):
            Document.objects.update(description='description updated')
            assert Document.objects.filter(description='description updated').count() == 5

        test_policies_for_cas_roles(Document, select_function=select_function, update_function=update_function)
