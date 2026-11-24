from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.models import Document, DocumentType
from registration.tests.constants import DOCUMENT_FIXTURE, TIMESTAMP_COMMON_FIELDS
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


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

    def test_supports_over_100_chars_in_file_name(self):
        long_file_name = "ten_chars " * 90 + ".longextension"
        document = make_recipe("registration.tests.utils.document", file=long_file_name)
        self.assertEqual(document.file.name, long_file_name)


class DocumentRlsTest(BaseTestCase):

    def test_document_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operation = make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        approved_document = make_recipe('registration.tests.utils.document', operation=approved_operation)
        other_operator = make_recipe('registration.tests.utils.operator')
        other_operation = make_recipe('registration.tests.utils.operation', operator=other_operator)
        other_document = make_recipe('registration.tests.utils.document', operation=other_operation)

        def select_function(cursor):
            Document.objects.get(id=approved_document.id)

        def forbidden_select_function(cursor):
            Document.objects.get(id=other_document.id)

        def insert_function(cursor):
            Document.objects.create(
                file='file.pdf',
                type=DocumentType.objects.first(),
                operation=approved_operation,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO erc.document(file, operation_id, type_id)
                    VALUES('file.pdf', %s, %s)
                """,
                (
                    other_operation.id,
                    DocumentType.objects.first().id,
                ),
            )
            return cursor.rowcount

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."document"
                    SET file = 'updated.pdf'
                    WHERE id = %s
                """,
                (str(approved_document.id),),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."document"
                    SET file = 'updated.pdf'
                    WHERE id = %s
                """,
                (str(other_document.id),),
            )
            return cursor.rowcount

        def delete_function(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."document"
                    WHERE id = %s
                """,
                (str(approved_document.id),),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."document"
                    WHERE id = %s
                """,
                (str(other_document.id),),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            Document,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_document_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "registration.tests.utils.document",
        )
        make_recipe(
            "registration.tests.utils.document",
        )

        def select_function(cursor):
            assert Document.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            Document,
            select_function=select_function,
        )
