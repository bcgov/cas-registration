from common.tests.utils.helpers import BaseTestCase
from common.tests.utils.model_inspection import get_cascading_models
from django.core.exceptions import ValidationError
from django.db import ProgrammingError
from model_bakery import baker
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_verification import ReportVerification
from reporting.models.report_version import ReportVersion
from reporting.tests.utils.bakers import report_baker, report_version_baker
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class ReportVersionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_version_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("report_type", "report type", None, None),
            ("is_latest_submitted", "is latest submitted", None, None),
            ("status", "status", 1000, None),
            ("reason_for_change", "reason for change", None, None),
            ("facility_reports", "facility report", None, 0),
            ("report_operation", "report operation", None, None),
            ("reportactivity_records", "report activity", None, 0),
            ("reportemission_records", "report emission", None, 0),
            ("report_person_responsible", "report person responsible", None, None),
            ("report_additional_data", "report additional data", None, None),
            (
                "report_non_attributable_emissions",
                "report non attributable emissions",
                None,
                None,
            ),
            ("reportfuel_records", "report fuel", None, 0),
            ("reportmethodology_records", "report methodology", None, 0),
            ("reportsourcetype_records", "report source type", None, 0),
            ("reportunit_records", "report unit", None, 0),
            ("report_products", "report product", None, 0),
            ("report_verification", "report verification", None, None),
            ("report_new_entrant", "report new entrant", None, None),
            ("report_attachments", "report attachment", None, 0),
            (
                "reportproductemissionallocation_records",
                "report product emission allocation",
                None,
                0,
            ),
            (
                "reportemissionallocation_records",
                "report emission allocation",
                None,
                0,
            ),
            (
                "report_operation_representatives",
                "report operation representative",
                None,
                None,
            ),
            (
                "report_compliance_summary",
                "report compliance summary",
                None,
                None,
            ),
            (
                "report_compliance_summary_products",
                "report compliance summary product",
                None,
                None,
            ),
            ("report_sign_off", "report sign off", None, None),
            ("report_electricity_import_data", "report electricity import data", None, None),
            ("report_attachment_confirmation", "report attachment confirmation", None, None),
        ]

    def test_unique_draft_version_per_report(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version_1 = baker.make_recipe(
            "reporting.tests.utils.report_version", status="Draft", report_id=report.id
        )

        with pytest.raises(
            ValidationError,
            match="Only one draft report version can exist on a report.",
        ):
            baker.make_recipe(
                "reporting.tests.utils.report_version",
                status="Draft",
                report_id=report.id,
            )

        report_version_1.status = "Submitted"
        report_version_1.save()

        baker.make_recipe(
            "reporting.tests.utils.report_version",
            status="Draft",
            report_id=report.id,
        )

    def test_submitted_report_version_is_immutable_except_is_latest_submitted(self):
        """
        Test that for a ReportVersion with status 'Submitted', any update is blocked
        unless the only change is to set is_latest_submitted from True to False.
        """
        # PRE‑ACT: mark this version as Submitted & latest
        self.test_object.status = ReportVersion.ReportVersionStatus.Submitted
        self.test_object.is_latest_submitted = True
        self.test_object.save()

        # Toggling only is_latest_submitted → allowed
        self.test_object.is_latest_submitted = False
        self.test_object.save()  # no exception

    def test_submitted_report_version_is_immutable_update(self):
        # PRE‑ACT: mark this version as Submitted & latest
        self.test_object.status = ReportVersion.ReportVersionStatus.Submitted
        self.test_object.is_latest_submitted = True
        self.test_object.save()

        with pytest.raises(
            ProgrammingError,
            match="pgtrigger: Cannot update rows from report_version table",
        ):
            self.test_object.report_type = ReportVersion.ReportType.SIMPLE_REPORT
            self.test_object.save()

    def test_submitted_report_version_is_immutable_update_related(self):

        report_additional_data = baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.test_object,
            capture_emissions=True,
        )

        # PRE‑ACT: mark this version as Submitted & latest
        self.test_object.status = ReportVersion.ReportVersionStatus.Submitted
        self.test_object.is_latest_submitted = True
        self.test_object.save()

        # update field in related table
        with pytest.raises(
            ProgrammingError,
            match="reportadditionaldata record is immutable after a report version has been submitted",
        ):
            report_additional_data.capture_emissions = False
            report_additional_data.save()

    # we only test insert on related tables, not report_version itself, because inserting a new report version doesn't affect the immutability of existing ones
    def test_submitted_report_version_is_immutable_insert_related(self):
        # PRE‑ACT: mark this version as Submitted & latest
        self.test_object.status = ReportVersion.ReportVersionStatus.Submitted
        self.test_object.is_latest_submitted = True
        self.test_object.save()
        self.test_object.refresh_from_db()

        with pytest.raises(
            ProgrammingError,
            match="reportverification record is immutable after a report version has been submitted",
        ):
            report_verification = ReportVerification.objects.create(report_version=self.test_object)
            report_verification.save()

    def test_submitted_report_version_is_immutable_delete(self):
        # PRE‑ACT: mark this version as Submitted & latest
        self.test_object.status = ReportVersion.ReportVersionStatus.Submitted
        self.test_object.is_latest_submitted = True
        self.test_object.save()
        self.test_object.refresh_from_db()
        with pytest.raises(
            ProgrammingError,
            # we hit the related table trigger first, so we get this error instead of the one from the report_version trigger
            # match="pgtrigger: Cannot delete rows from report_version table",
            match="reportoperation record is immutable after a report version has been submitted",
        ):
            self.test_object.delete()

    def test_submitted_report_version_is_immutable_delete_related(self):
        eio_data = baker.make_recipe(
            "reporting.tests.utils.electricity_import_data",
            report_version=self.test_object,
        )
        # PRE‑ACT: mark this version as Submitted & latest
        self.test_object.status = ReportVersion.ReportVersionStatus.Submitted
        self.test_object.is_latest_submitted = True
        self.test_object.save()
        self.test_object.refresh_from_db()

        # delete record in related table
        with pytest.raises(
            ProgrammingError,
            match="reportelectricityimportdata record is immutable after a report version has been submitted",
        ):
            eio_data.delete()

    def test_all_report_version_models_have_the_immutability_trigger(self):
        report_version_models = get_cascading_models(ReportVersion)

        missing_triggers = [
            m.__name__
            for m in report_version_models
            if not any(trigger.name == "immutable_report_version" for trigger in m._meta.triggers)
        ]

        missing_triggers.remove(
            'ComplianceReportVersion'
        )  # Created compliance_report_version record should not be immutable after report submission
        missing_triggers.remove(
            'ComplianceObligation'
        )  # Created compliance_obligation record should not be immutable after report submission
        missing_triggers.remove(
            'ComplianceEarnedCredit'
        )  # Created compliance_earned_credit record should not be immutable after report submission
        assert (
            missing_triggers == []
        ), f"{', '.join(missing_triggers)} models are missing the `immutable_report_version` trigger"

class ReportVersionRlsTest(BaseTestCase):

    def test_report_version_rls_industry_user(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        report = report_baker( operation=operation, operator=approved_user_operator.operator,)
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
            status=ReportVersion.ReportVersionStatus.Submitted,
        )
        number_of_accesible_records = ReportVersion.objects.count()
        random_operation = baker.make_recipe('registration.tests.utils.operation')
        random_report = report_baker(
            operation=random_operation,
        )
        random_report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=random_report,
            status=ReportVersion.ReportVersionStatus.Draft,
        )

        number_of_total_records = ReportVersion.objects.count()

        def select_function(cursor):
            # Select the report version for the approved user operator and not the random report version
            assert ReportVersion.objects.count() < number_of_total_records
            assert ReportVersion.objects.count() == number_of_accesible_records
            assert ReportVersion.objects.filter(report=random_report).count() == 0

        def insert_function(cursor):
            # Insert a new report version for the approved user operator
            new_report_version = ReportVersion.objects.create(
                report=report,
                is_latest_submitted=False,
                status=ReportVersion.ReportVersionStatus.Draft,
            )
            number_of_accesible_records_after_insert = number_of_accesible_records + 1
            assert ReportVersion.objects.count() == number_of_accesible_records_after_insert
            assert new_report_version.id is not None
            # Attempt to insert a report version that the user is not an operator for
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "report_version'
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."report_version" (
                        "report_id", "is_latest_submitted", "status", "report_type"
                    )
                    VALUES (%s, %s, %s, %s)
                    """,
                    [random_report.id, False, ReportVersion.ReportVersionStatus.Draft, ReportVersion.ReportType.ANNUAL_REPORT],
                )

        def update_function(cursor):
            # Update the report version for the approved user operator
            new_report_version = ReportVersion.objects.create(
                report=report,
                report_type=report_version.report_type,
                is_latest_submitted=False,
                status=ReportVersion.ReportVersionStatus.Draft,
            )
            new_status = ReportVersion.ReportVersionStatus.Submitted
            new_report_version.status = new_status
            new_report_version.save()
            assert ReportVersion.objects.get(id=new_report_version.id).status == new_status
            # Attempt to update a report version that the user should not have access to

            cursor.execute(
                """
                UPDATE "erc"."report_version"
                SET "status" = %s
                WHERE "id" = %s
                """,
                [ReportVersion.ReportVersionStatus.Submitted, random_report_version.id],
            )
            assert cursor.rowcount == 0

        def delete_function(cursor):
            # Try to delete the report version for the approved user where the status is not 'Draft'
            number_of_deleted_report_versions, _ = report_version.delete()
            assert number_of_deleted_report_versions == 0
            assert ReportVersion.objects.count() == number_of_accesible_records
            # Create a new report version with status 'Draft' to delete
            new_report_version = ReportVersion.objects.create(
                report=report,
                report_type=report_version.report_type,
                is_latest_submitted=False,
                status=ReportVersion.ReportVersionStatus.Draft,
            )
            assert ReportVersion.objects.count() == number_of_accesible_records + 1
            # Delete the new report version
            number_of_deleted_report_versions, _ = new_report_version.delete()
            assert number_of_deleted_report_versions == 1
            assert ReportVersion.objects.count() == number_of_accesible_records
            # Attempt to delete a report version that the user should not have access to
            number_of_deleted_report_versions, _ = random_report_version.delete()
            assert number_of_deleted_report_versions == 0

        test_policies_for_industry_user(
            ReportVersion, 
            approved_user_operator.user, 
            select_function, 
            insert_function, 
            update_function, 
            delete_function
        )
    def test_report_version_rls_cas_user(self):
        """
        Test RLS for ReportVersion model for CAS users.
        """
        test_quantity = 5
        report_version_baker("reporting.tests.utils.report_version", _quantity=test_quantity)

        def select_function(cursor, i):
            assert ReportVersion.objects.count() == test_quantity
        
        test_policies_for_cas_roles(
            ReportVersion, 
            select_function,
        )
       