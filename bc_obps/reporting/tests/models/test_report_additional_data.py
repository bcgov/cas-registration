from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.bakers import report_additional_data_baker
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.rls_test_recipe import ReportRlsSetup
from rls.tests.helpers import test_policies_for_industry_user


class ReportAdditionalDataTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_additional_data_baker()
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("capture_emissions", "capture emissions", None, None),
            ("emissions_on_site_use", "emissions on site use", None, None),
            (
                "emissions_on_site_sequestration",
                "emissions on site sequestration",
                None,
                None,
            ),
            ("emissions_off_site_transfer", "emissions off site transfer", None, None),
            ("electricity_generated", "electricity generated", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_additional_data")

class ReportAdditionalDataRlsTest(BaseTestCase):
    def test_report_additional_data_rls_industry_user(self):
        test = ReportRlsSetup()
        report_additional_data = report_additional_data_baker(
            report_version=test.report_version
        )
        number_of_accessible_records = (
            report_additional_data.objects.filter(
                report_version=test.report_version
            ).count()
        )
        random = ReportRlsSetup()
        random_report_additional_data = report_additional_data_baker(
            report_version=random.report_version
        )

        number_of_total_records = report_additional_data.objects.count()

        def select_function(cursor):
            assert (
                report_additional_data.objects.count() < number_of_total_records
            )
            assert (
                report_additional_data.objects.count() == number_of_accessible_records
            )
            assert (
                report_additional_data.objects.filter(
                    report_version=random.report_version
                ).count()
                == 0
            )

        def insert_function(cursor):
            new_report_additional_data = (
                report_additional_data.objects.create(
                    report_version=test.report_version,
                    electricity_generated=8675.309,
                )
            )
            number_of_accessible_records_after_insert = (
                number_of_accessible_records + 1
            )
            assert (
                report_additional_data.objects.count()
                == number_of_accessible_records_after_insert
            )
            assert new_report_additional_data.id is not None

            with pytest.raises(
                ProgrammingError,
                match='new row violates row-level security policy for table "reportadditionaldata"',
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."report_additional_data" (
                        "report_version_id", "electricity_generated"
                    )
                    VALUES (%s, %s)
                    """,
                    (
                        random.report_version.id,
                        649.0,
                        
                    ),
                )

        def update_function(cursor):
            report_additional_data.electricity_generated = 1234.567
            report_additional_data.save()
            assert (
                report_additional_data.objects.get(id=report_additional_data.id).electricity_generated
                == 1234.567
            )

            cursor.execute(
                """
                UPDATE "erc"."report_additional_data"
                SET "electricity_generated" = %s
                WHERE "id" = %s
                """,
                (9876.543, random_report_additional_data.id),
            )
        
        def delete_function(cursor):
            assert (
                report_additional_data.objects.filter(
                    report_version=test.report_version
                ).count()
                == number_of_accessible_records
            )
            number_of_deleted_records, _ = report_additional_data.delete()
            number_of_accessible_records_after_delete = (
                number_of_accessible_records - number_of_deleted_records
            )
            assert number_of_deleted_records > 0
            assert (
                report_additional_data.objects.count()
                == number_of_accessible_records_after_delete
            )

            number_of_deleted_records, _ = random_report_additional_data.delete()
            assert number_of_deleted_records == 0
            assert (
                report_additional_data.objects.count()
                == number_of_accessible_records_after_delete
            )
            
        test_policies_for_industry_user(
            report_additional_data,
            test.approved_user_operator.user,
            select_function,
            insert_function,
            update_function,
            delete_function,
        )
