from django.test import TestCase
from unittest.mock import MagicMock, patch
from model_bakery.baker import make_recipe
from django.core.files.base import ContentFile
from django.utils import timezone
from registration.models import Operation
from reporting.models.report_raw_activity_data import ReportRawActivityData
from reporting.tests.service.test_report_activity_save_service import data
from reporting.service.report_supplementary_version_service.report_supplementary_version_service import (
    ReportSupplementaryVersionService,
)
from reporting.service.report_supplementary_version_service.report_supplementary_cloning import (
    ReportSupplementaryCloning,
)
from reporting.models import (
    FacilityReport,
    ReportActivity,
    ReportAdditionalData,
    ReportAttachment,
    ReportEmission,
    ReportMethodology,
    ReportNewEntrant,
    ReportNewEntrantEmission,
    ReportNewEntrantProduction,
    ReportOperation,
    ReportOperationRepresentative,
    ReportPersonResponsible,
    ReportVerification,
    ReportVerificationVisit,
    ReportVersion,
)
import common.lib.pgtrigger as pgtrigger


class ReportSupplementaryVersionServiceTests(TestCase):
    def setUp(self):
        # Past and Current reporting year setup
        self.operator = make_recipe("registration.tests.utils.operator")
        self.operation = make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        self.current_reporting_year = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2030)
        self.past_reporting_year = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2029)

        self.past_year_old_report = make_recipe(
            'reporting.tests.utils.report', operator=self.operator, operation=self.operation, reporting_year_id=2029
        )
        self.past_year_old_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Draft,
            report=self.past_year_old_report,
        )

        self.past_year_old_report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.past_year_old_report_version,
            operator_legal_name=self.operator.legal_name,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        self.past_year_representative = make_recipe(
            'reporting.tests.utils.report_operation_representative',
            report_version=self.past_year_old_report_version,
            representative_name="Current Rep",
        )
        self.past_year_person_responsible = make_recipe(
            'reporting.tests.utils.report_person_responsible',
            report_version=self.past_year_old_report_version,
        )
        self.past_year_additional_data = make_recipe(
            'reporting.tests.utils.report_additional_data',
            report_version=self.past_year_old_report_version,
            capture_emissions=True,
            electricity_generated=999.0,
        )
        self.past_year_facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
            report_version=self.past_year_old_report_version,
        )

        self.current_year_report = make_recipe(
            'reporting.tests.utils.report', operator=self.operator, operation=self.operation, reporting_year_id=2030
        )
        self.current_year_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Draft,
            report=self.current_year_report,
        )
        self.current_year_report_operation = make_recipe(
            "reporting.tests.utils.report_operation", report_version=self.current_year_report_version
        )

        self.current_year_representative = make_recipe(
            'reporting.tests.utils.report_operation_representative',
            report_version=self.current_year_report_version,
            representative_name="Current Rep",
        )
        self.current_year_person_responsible = make_recipe(
            'reporting.tests.utils.report_person_responsible',
            report_version=self.current_year_report_version,
        )
        self.current_year_additional_data = make_recipe(
            'reporting.tests.utils.report_additional_data',
            report_version=self.current_year_report_version,
            capture_emissions=True,
            electricity_generated=999.0,
        )
        self.current_year_facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
            report_version=self.current_year_report_version,
        )

        # Create old and new ReportVersion instances
        self.old_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Draft,
        )

        # Create a regulated product.
        self.old_regulated_product = make_recipe('registration.tests.utils.regulated_product')

        # Create an activity (shared by operation)
        self.old_activity = make_recipe('reporting.tests.utils.activity')

        # Create a ReportOperation instance associated with the old report version
        self.old_report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.old_report_version,
            operator_legal_name="Legal Name",
            operator_trade_name="Trade Name",
            operation_name="Operation Name",
            operation_type=Operation.Types.SFO,
            operation_bcghgid="A fake BC GHG ID",
            bc_obps_regulated_operation_id="123456789",
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            regulated_products=[self.old_regulated_product],
            activities=[self.old_activity],
        )

        # Create two ReportOperationRepresentative instances for the old report version
        self.old_rep1 = make_recipe(
            'reporting.tests.utils.report_operation_representative', report_version=self.old_report_version
        )
        self.old_rep2 = make_recipe(
            'reporting.tests.utils.report_operation_representative',
            report_version=self.old_report_version,
            representative_name="Another Rep",
        )

        # Create a ReportPersonResponsible instance for the old report version
        self.old_person = make_recipe(
            'reporting.tests.utils.report_person_responsible',
            report_version=self.old_report_version,
        )

        # Create ReportAdditionalData for the old report version
        self.old_additional_data = make_recipe(
            'reporting.tests.utils.report_additional_data',
            report_version=self.old_report_version,
            capture_emissions=True,
            emissions_on_site_use=100.0,
            emissions_on_site_sequestration=50.0,
            emissions_off_site_transfer=20.0,
            electricity_generated=500.0,
        )

        # Create a ReportNewEntrant and its related records for the old report version
        self.old_new_entrant = make_recipe(
            'reporting.tests.utils.report_new_entrant',
            report_version=self.old_report_version,
        )
        self.old_emission = make_recipe(
            'reporting.tests.utils.report_new_entrant_emission',
            report_new_entrant=self.old_new_entrant,
            emission="5.0000",
        )
        self.old_production = make_recipe(
            'reporting.tests.utils.report_new_entrant_production',
            report_new_entrant=self.old_new_entrant,
            production_amount="10.0000",
        )

        # Create an old FacilityReport associated with the old report version
        self.old_facility_report: FacilityReport = make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.old_report_version
        )

        # Simulate user adding a few extra activities, since the workflow allows it
        self.old_facility_report.activities.set(
            [
                self.old_activity,
                make_recipe('reporting.tests.utils.activity'),
                make_recipe('reporting.tests.utils.activity'),
            ]
        )

        # Create a ReportActivity for the old FacilityReport with realistic test data
        self.old_facility_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=self.old_facility_report,
            report_version=self.old_report_version,
            json_data=data.test_data,
        )

        # Create a ReportRawActivityData for self.old_facility_activity
        self.old_facility_activity_raw_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report=self.old_facility_activity.facility_report,
            activity=self.old_facility_activity.activity,
            json_data=self.old_facility_activity.json_data,
        )

        # Create a reportEmissionAllocation for the report
        self.old_report_emission_allocation = make_recipe(
            "reporting.tests.utils.report_emission_allocation",
            report_version=self.old_report_version,
            facility_report=self.old_facility_report,
        )

        self.old_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.old_report_version.is_latest_submitted = True
        self.old_report_version.save()

        self.new_report_version: ReportVersion = make_recipe(
            'reporting.tests.utils.report_version',
            report=self.old_report_version.report,
            status=ReportVersion.ReportVersionStatus.Draft,
        )

    def test_create_report_supplementary_version(self):
        # ACT: Call the method to create a supplementary version.
        self.new_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.new_report_version.save()
        new_version = ReportSupplementaryVersionService._create_supplementary_version(self.old_report_version)

        # ASSERT: Verify that the new report version is correctly created.
        self.assertEqual(
            new_version.report,
            self.old_report_version.report,
            "The new report version should be associated with the same report as the original.",
        )
        self.assertEqual(
            new_version.report_type,
            self.old_report_version.report_type,
            "The new report version should have the same report type as the original.",
        )
        self.assertEqual(
            new_version.status,
            ReportVersion.ReportVersionStatus.Draft,
            "The new report version should be created with status Draft.",
        )
        self.assertFalse(
            new_version.is_latest_submitted,
            "The new report version should not be marked as the latest submitted version.",
        )

    def test_create_or_clone_same_purpose_no_operator_change(self):
        """Test that when purpose hasn't changed and operator hasn't changed, supplementary version is created."""
        operation = self.old_report_version.report.operation
        operation.registration_purpose = Operation.Purposes.OBPS_REGULATED_OPERATION
        operation.save()

        self.old_report_version.report.operator = operation.operator
        self.old_report_version.report.save()

        self.new_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.new_report_version.save()

        new_version = ReportSupplementaryVersionService.create_or_clone_report_version(self.old_report_version.id)

        self.assertEqual(new_version.report, self.old_report_version.report)
        self.assertIsNotNone(ReportOperation.objects.filter(report_version=new_version).first())

    @patch('service.reporting_year_service.ReportingYearService.get_current_reporting_year')
    def test_create_or_clone_purpose_changed_past_year_creates_supplementary(self, mock_get_year):
        """Test that when registration purpose has changed since the past report was submitted,
        a supplementary (cloned) version is created for the past year."""
        self.past_year_old_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.past_year_old_report_version.save()

        self.operation.registration_purpose = Operation.Purposes.OPTED_IN_OPERATION
        self.operation.save()

        mock_get_year.return_value = self.current_reporting_year

        new_past_year_report_version = ReportSupplementaryVersionService.create_or_clone_report_version(
            self.past_year_old_report_version.id
        )

        self.assertEqual(
            new_past_year_report_version.report_operation.registration_purpose,
            Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        # ReportOperation is cloned from the submitted version (old purpose/operator details)
        new_report_op = new_past_year_report_version.report_operation
        self.assertEqual(new_report_op.registration_purpose, Operation.Purposes.OBPS_REGULATED_OPERATION)
        self.assertEqual(new_report_op.operator_legal_name, self.operator.legal_name)

        # ReportOperationRepresentative is cloned
        new_reps = ReportOperationRepresentative.objects.filter(report_version=new_past_year_report_version)
        self.assertEqual(new_reps.count(), 1)
        self.assertEqual(new_reps.first().representative_name, self.past_year_representative.representative_name)

        # ReportPersonResponsible is cloned
        new_person = ReportPersonResponsible.objects.filter(report_version=new_past_year_report_version).first()
        self.assertIsNotNone(new_person, "Cloned version should have a ReportPersonResponsible.")
        self.assertEqual(new_person.first_name, self.past_year_person_responsible.first_name)
        self.assertEqual(new_person.last_name, self.past_year_person_responsible.last_name)

        # ReportAdditionalData is cloned
        new_additional = ReportAdditionalData.objects.filter(report_version=new_past_year_report_version).first()
        self.assertIsNotNone(new_additional, "Cloned version should have ReportAdditionalData.")
        self.assertEqual(new_additional.capture_emissions, self.past_year_additional_data.capture_emissions)
        self.assertEqual(new_additional.electricity_generated, self.past_year_additional_data.electricity_generated)

        # FacilityReport is cloned
        new_facility = FacilityReport.objects.filter(report_version=new_past_year_report_version).first()
        self.assertIsNotNone(new_facility, "Cloned version should have a FacilityReport.")
        self.assertEqual(new_facility.facility_id, self.past_year_facility_report.facility_id)

    @patch('service.report_version_service.ReportVersionService.create_report_version')
    @patch('service.reporting_year_service.ReportingYearService.get_current_reporting_year')
    def test_create_or_clone_purpose_changed_current_year_creates_blank(self, mock_get_year, mock_create):
        """Test that for current years with purpose change, a blank version is created (no cloned data)."""

        # Mock the current reporting year to match the current year report's year
        mock_get_year.return_value = self.current_reporting_year

        self.current_year_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.current_year_report_version.save()

        # Change the operation's registration purpose so purpose_changed=True
        self.operation.registration_purpose = Operation.Purposes.NEW_ENTRANT_OPERATION
        self.operation.save()

        new_current_year_report_version = ReportSupplementaryVersionService.create_or_clone_report_version(
            self.current_year_report_version.id
        )

        self.assertEqual(
            new_current_year_report_version.report_operation.registration_purpose,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        )

        self.assertIsNone(
            ReportPersonResponsible.objects.filter(report_version=new_current_year_report_version).first(),
            "Blank version should have no ReportPersonResponsible.",
        )
        self.assertIsNone(
            ReportAdditionalData.objects.filter(report_version=new_current_year_report_version).first(),
            "Blank version should have no ReportAdditionalData.",
        )
        self.assertFalse(
            FacilityReport.objects.filter(report_version=new_current_year_report_version).exists(),
            "Blank version should have no FacilityReport.",
        )
        self.assertFalse(
            ReportOperationRepresentative.objects.filter(report_version=new_current_year_report_version).exists(),
            "Blank version should have no ReportOperationRepresentative.",
        )

    def test_create_or_clone_operator_changed_purpose_changed_creates_supplementary_with_same_details(self):
        """Test that when operator and purpose both change, supplementary version is created cloning the submitted version's details."""
        # --- Arrange: populate current_year_report_version with data to be cloned ---

        # Update the existing bare report_operation with meaningful values
        self.current_year_report_operation.operator_legal_name = self.operator.legal_name
        self.current_year_report_operation.operator_trade_name = self.operator.trade_name
        self.current_year_report_operation.operation_name = self.operation.name
        self.current_year_report_operation.operation_type = Operation.Types.SFO
        self.current_year_report_operation.registration_purpose = Operation.Purposes.OBPS_REGULATED_OPERATION
        self.current_year_report_operation.save()

        self.current_year_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.current_year_report_version.is_latest_submitted = True
        self.current_year_report_version.save()

        # --- Act: change operator and purpose, then create supplementary version ---
        new_operator = make_recipe("registration.tests.utils.operator")
        operation = self.current_year_report_version.report.operation
        operation.registration_purpose = Operation.Purposes.NEW_ENTRANT_OPERATION
        operation.operator = new_operator
        operation.save()

        new_current_year_report_version = ReportSupplementaryVersionService.create_or_clone_report_version(
            self.current_year_report_version.id
        )
        # ReportOperation is cloned from the submitted version (old purpose/operator details)
        new_report_op = new_current_year_report_version.report_operation
        self.assertEqual(new_report_op.registration_purpose, Operation.Purposes.OBPS_REGULATED_OPERATION)
        self.assertEqual(new_report_op.operator_legal_name, self.operator.legal_name)

        # ReportOperationRepresentative is cloned
        new_reps = ReportOperationRepresentative.objects.filter(report_version=new_current_year_report_version)
        self.assertEqual(new_reps.count(), 1)
        self.assertEqual(new_reps.first().representative_name, self.current_year_representative.representative_name)

        # ReportPersonResponsible is cloned
        new_person = ReportPersonResponsible.objects.filter(report_version=new_current_year_report_version).first()
        self.assertIsNotNone(new_person, "Cloned version should have a ReportPersonResponsible.")
        self.assertEqual(new_person.first_name, self.current_year_person_responsible.first_name)
        self.assertEqual(new_person.last_name, self.current_year_person_responsible.last_name)

        # ReportAdditionalData is cloned
        new_additional = ReportAdditionalData.objects.filter(report_version=new_current_year_report_version).first()
        self.assertIsNotNone(new_additional, "Cloned version should have ReportAdditionalData.")
        self.assertEqual(new_additional.capture_emissions, self.current_year_additional_data.capture_emissions)
        self.assertEqual(new_additional.electricity_generated, self.current_year_additional_data.electricity_generated)

        # FacilityReport is cloned
        new_facility = FacilityReport.objects.filter(report_version=new_current_year_report_version).first()
        self.assertIsNotNone(new_facility, "Cloned version should have a FacilityReport.")
        self.assertEqual(new_facility.facility_id, self.current_year_facility_report.facility_id)

    def test_clone_report_version_operation(self):
        """
        Test that the cloning method for ReportOperation correctly duplicates
        all scalar field values and many-to-many relationships (regulated_products and activities)
        from the old report version to a new report version.
        """
        # PRE-ACT: Assert initial count of ReportOperation for old_report_version is 1.
        initial_count = ReportOperation.objects.filter(report_version=self.old_report_version).count()
        self.assertEqual(initial_count, 1, "There should be one ReportOperation initially.")

        ReportSupplementaryCloning.clone_report_version_operation(self.old_report_version, self.new_report_version)

        new_count = ReportOperation.objects.filter(
            report_version__in=[self.old_report_version, self.new_report_version]
        ).count()
        self.assertEqual(new_count, 2, "A new ReportOperation should be created after cloning.")

        old_operation = ReportOperation.objects.get(report_version=self.old_report_version)
        new_operation = ReportOperation.objects.get(report_version=self.new_report_version)

        self.assertEqual(new_operation.operator_legal_name, old_operation.operator_legal_name)
        self.assertEqual(new_operation.operator_trade_name, old_operation.operator_trade_name)
        self.assertEqual(new_operation.operation_name, old_operation.operation_name)
        self.assertEqual(new_operation.operation_type, old_operation.operation_type)
        self.assertEqual(new_operation.registration_purpose, old_operation.registration_purpose)
        self.assertEqual(new_operation.operation_bcghgid, old_operation.operation_bcghgid)
        self.assertEqual(new_operation.bc_obps_regulated_operation_id, old_operation.bc_obps_regulated_operation_id)

        old_regulated_ids = set(old_operation.regulated_products.values_list('id', flat=True))
        new_regulated_ids = set(new_operation.regulated_products.values_list('id', flat=True))
        self.assertEqual(old_regulated_ids, new_regulated_ids)

        old_activities_ids = set(old_operation.activities.values_list('id', flat=True))
        new_activities_ids = set(new_operation.activities.values_list('id', flat=True))
        self.assertEqual(old_activities_ids, new_activities_ids)

    def test_clone_report_version_representatives(self):
        """
        Test that the clone_report_version_representatives method copies all representatives
        from the old report version to the new report version, preserving their field values.
        """
        # PRE-ACT: Assert initial counts of representatives.
        self.assertEqual(
            ReportOperationRepresentative.objects.filter(report_version=self.old_report_version).count(), 2
        )
        self.assertEqual(
            ReportOperationRepresentative.objects.filter(report_version=self.new_report_version).count(), 0
        )

        ReportSupplementaryCloning.clone_report_version_representatives(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Verify that two new representatives have been created.
        new_reps = ReportOperationRepresentative.objects.filter(report_version=self.new_report_version)
        self.assertEqual(new_reps.count(), 2, "Two representatives should be created after cloning.")

        # ASSERT: Check that each new representative's fields match those of the old representatives.
        old_reps = {
            rep.representative_name: rep
            for rep in ReportOperationRepresentative.objects.filter(report_version=self.old_report_version)
        }
        for new_rep in new_reps:
            self.assertIn(new_rep.representative_name, old_reps)
            self.assertEqual(new_rep.selected_for_report, old_reps[new_rep.representative_name].selected_for_report)

    def test_clone_report_version_person_responsible(self):
        """
        Test that clone_report_version_person_responsible correctly clones the ReportPersonResponsible
        from the old report version to the new report version by copying all relevant fields.
        """
        # PRE-ACT: Verify that a ReportPersonResponsible exists for the old report version and none for the new version.
        self.assertIsNotNone(ReportPersonResponsible.objects.filter(report_version=self.old_report_version).first())
        self.assertIsNone(ReportPersonResponsible.objects.filter(report_version=self.new_report_version).first())

        ReportSupplementaryCloning.clone_report_version_person_responsible(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Retrieve and verify the cloned ReportPersonResponsible.
        new_person = ReportPersonResponsible.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNotNone(new_person)
        self.assertEqual(new_person.first_name, self.old_person.first_name)
        self.assertEqual(new_person.last_name, self.old_person.last_name)
        self.assertEqual(new_person.email, self.old_person.email)
        self.assertEqual(new_person.phone_number, self.old_person.phone_number)
        self.assertEqual(new_person.position_title, self.old_person.position_title)
        self.assertEqual(new_person.business_role, self.old_person.business_role)
        self.assertEqual(new_person.street_address, self.old_person.street_address)
        self.assertEqual(new_person.municipality, self.old_person.municipality)
        self.assertEqual(new_person.province, self.old_person.province)
        self.assertEqual(new_person.postal_code, self.old_person.postal_code)

    def test_clone_report_version_additional_data(self):
        """
        Test that clone_report_version_additional_data correctly clones the ReportAdditionalData
        from the old report version to the new report version, copying all relevant field values.
        """
        # PRE-ACT: Assert that additional data exists for the old report version and not for the new version.
        self.assertIsNotNone(ReportAdditionalData.objects.filter(report_version=self.old_report_version).first())
        self.assertIsNone(ReportAdditionalData.objects.filter(report_version=self.new_report_version).first())

        ReportSupplementaryCloning.clone_report_version_additional_data(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Retrieve and verify the cloned additional data.
        new_additional_data = ReportAdditionalData.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNotNone(new_additional_data)
        self.assertEqual(new_additional_data.capture_emissions, self.old_additional_data.capture_emissions)
        self.assertEqual(new_additional_data.emissions_on_site_use, self.old_additional_data.emissions_on_site_use)
        self.assertEqual(
            new_additional_data.emissions_on_site_sequestration,
            self.old_additional_data.emissions_on_site_sequestration,
        )
        self.assertEqual(
            new_additional_data.emissions_off_site_transfer, self.old_additional_data.emissions_off_site_transfer
        )
        self.assertEqual(new_additional_data.electricity_generated, self.old_additional_data.electricity_generated)

    def test_clone_report_version_new_entrant_data(self):
        """
        Test that clone_report_version_new_entrant_data clones the ReportNewEntrant,
        along with its related emissions and production records, from the old report version to the new one.
        """
        # PRE-ACT: Assert that the old report version has a ReportNewEntrant and record counts.
        old_new_entrant_instance = ReportNewEntrant.objects.filter(report_version=self.old_report_version).first()
        self.assertIsNotNone(old_new_entrant_instance)
        old_emissions_count = ReportNewEntrantEmission.objects.filter(
            report_new_entrant=old_new_entrant_instance
        ).count()
        old_productions_count = ReportNewEntrantProduction.objects.filter(
            report_new_entrant=old_new_entrant_instance
        ).count()
        self.assertGreater(old_emissions_count, 0)
        self.assertGreater(old_productions_count, 0)
        self.assertIsNone(ReportNewEntrant.objects.filter(report_version=self.new_report_version).first())

        ReportSupplementaryCloning.clone_report_version_new_entrant_data(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Verify that a new ReportNewEntrant has been created (count increases from 0 to 1).
        new_new_entrant_instance = ReportNewEntrant.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNotNone(new_new_entrant_instance)
        self.assertEqual(new_new_entrant_instance.authorization_date, old_new_entrant_instance.authorization_date)
        self.assertEqual(new_new_entrant_instance.first_shipment_date, old_new_entrant_instance.first_shipment_date)
        self.assertEqual(
            new_new_entrant_instance.new_entrant_period_start, old_new_entrant_instance.new_entrant_period_start
        )
        self.assertEqual(new_new_entrant_instance.assertion_statement, old_new_entrant_instance.assertion_statement)

        # ASSERT: Verify that emissions are cloned correctly.
        new_emissions = ReportNewEntrantEmission.objects.filter(report_new_entrant=new_new_entrant_instance)
        self.assertEqual(new_emissions.count(), old_emissions_count)
        for new_emission in new_emissions:
            old_emission = ReportNewEntrantEmission.objects.filter(
                report_new_entrant=old_new_entrant_instance, emission=new_emission.emission
            ).first()
            self.assertIsNotNone(old_emission)
            self.assertEqual(new_emission.emission_category.id, old_emission.emission_category.id)
            self.assertEqual(new_emission.emission, old_emission.emission)

        # ASSERT: Verify that production records are cloned correctly.
        new_productions = ReportNewEntrantProduction.objects.filter(report_new_entrant=new_new_entrant_instance)
        self.assertEqual(new_productions.count(), old_productions_count)
        for new_prod in new_productions:
            old_prod = ReportNewEntrantProduction.objects.filter(
                report_new_entrant=old_new_entrant_instance, production_amount=new_prod.production_amount
            ).first()
            self.assertIsNotNone(old_prod)
            self.assertEqual(new_prod.product.id, old_prod.product.id)
            self.assertEqual(new_prod.production_amount, old_prod.production_amount)

    def test_clone_report_version_verification(self):
        """
        Test that clone_report_version_verification clones a ReportVerification (and its visits)
        from the old report version to the new report version.
        """
        # PRE-ACT: Create a ReportVerification and an associated Visit for the old report version.
        with pgtrigger.ignore('reporting.ReportVerification:immutable_report_version'):
            verification = make_recipe(
                'reporting.tests.utils.report_verification',
                report_version=self.old_report_version,
                verification_body_name="Test Verification Body",
                accredited_by=ReportVerification.AccreditedBy.ANAB,
                scope_of_verification=ReportVerification.ScopeOfVerification.BC_OBPS,
                threats_to_independence=True,
                verification_conclusion=ReportVerification.VerificationConclusion.POSITIVE,
            )
        with pgtrigger.ignore('reporting.ReportVerificationVisit:immutable_report_version'):
            make_recipe(
                'reporting.tests.utils.report_verification_visit',
                report_verification=verification,
                visit_name="Test Visit",
                visit_type=ReportVerificationVisit.VisitType.IN_PERSON,
                visit_coordinates="(10.0, 20.0)",
                is_other_visit=False,
            )

        ReportSupplementaryCloning.clone_report_version_verification(self.old_report_version, self.new_report_version)

        # ASSERT: Verify that a new ReportVerification has been created (record count increases).
        new_verification = ReportVerification.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNotNone(new_verification)
        self.assertEqual(new_verification.verification_body_name, verification.verification_body_name)
        self.assertEqual(new_verification.accredited_by, verification.accredited_by)
        self.assertEqual(new_verification.scope_of_verification, verification.scope_of_verification)
        self.assertEqual(new_verification.threats_to_independence, verification.threats_to_independence)
        self.assertEqual(new_verification.verification_conclusion, verification.verification_conclusion)

        # ASSERT: Verify that the associated ReportVerificationVisits were cloned.
        old_visits = list(verification.report_verification_visits.all())
        new_visits = list(new_verification.report_verification_visits.all())
        self.assertEqual(len(new_visits), len(old_visits))
        for old_visit, new_visit in zip(old_visits, new_visits):
            self.assertEqual(new_visit.visit_name, old_visit.visit_name)
            self.assertEqual(new_visit.visit_type, old_visit.visit_type)
            self.assertEqual(new_visit.visit_coordinates, old_visit.visit_coordinates)
            self.assertEqual(new_visit.is_other_visit, old_visit.is_other_visit)

    def test_clone_report_version_verification_no_existing(self):
        """
        Test that clone_report_version_verification does nothing if no ReportVerification exists for the old report version.
        """
        # PRE-ACT: Ensure there are no ReportVerification records for the old report version.

        ReportVerification.objects.filter(report_version=self.old_report_version).delete()
        # ACT: Attempt to clone ReportVerification.
        ReportSupplementaryCloning.clone_report_version_verification(self.old_report_version, self.new_report_version)

        ReportSupplementaryCloning.clone_report_version_verification(self.old_report_version, self.new_report_version)

        new_verification = ReportVerification.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNone(new_verification)

    def test_clone_report_version_attachments(self):
        """
        Test that clone_report_version_attachments clones all ReportAttachment instances
        from the old report version to the new report version.
        """
        with pgtrigger.ignore('reporting.ReportAttachment:immutable_report_version'):
            make_recipe(
                'reporting.tests.utils.report_attachment',
                report_version=self.old_report_version,
                attachment=ContentFile(b"dummy file content", "file1.pdf"),
                attachment_type="verification_statement",
                attachment_name="Attachment 1",
            )
        with pgtrigger.ignore('reporting.ReportAttachment:immutable_report_version'):
            make_recipe(
                'reporting.tests.utils.report_attachment',
                report_version=self.old_report_version,
                attachment=ContentFile(b"dummy file content", "file2.doc"),
                attachment_type="wci_352_362",
                attachment_name="Attachment 2",
            )

        with patch("django.core.files.storage.default_storage.duplicate_file") as mock_duplicate:
            mock_duplicate.return_value = "test_file"

            ReportSupplementaryCloning.clone_report_version_attachments(
                self.old_report_version, self.new_report_version
            )

            current_year = timezone.now().year
            assert len(mock_duplicate.mock_calls) == 2
            call_args = [str(call_obj) for call_obj in mock_duplicate.mock_calls]
            assert any(f"report_attachments/{current_year}/file1" in arg and ".pdf" in arg for arg in call_args)
            assert any(f"report_attachments/{current_year}/file2" in arg and ".doc" in arg for arg in call_args)

        new_attachments = ReportAttachment.objects.filter(report_version=self.new_report_version)
        self.assertEqual(new_attachments.count(), 2)
        for old_attachment in ReportAttachment.objects.filter(report_version=self.old_report_version):
            cloned_attachment = new_attachments.filter(
                attachment_type=old_attachment.attachment_type,
                attachment_name=old_attachment.attachment_name,
            ).first()
            self.assertIsNotNone(cloned_attachment)

    def test_clone_facility_with_activities(self):
        """
        Test that clone_report_version_facilities clones a FacilityReport (with associated ReportActivity)
        from the old report version to the new report version.
        """
        initial_count = FacilityReport.objects.filter(report_version=self.old_report_version).count()
        self.assertEqual(initial_count, 1, "There should be one FacilityReport initially.")

        ReportSupplementaryCloning.clone_report_version_facilities(self.old_report_version, self.new_report_version)

        new_count = FacilityReport.objects.filter(
            report_version__in=[self.old_report_version, self.new_report_version]
        ).count()
        self.assertEqual(new_count, 2, "A new FacilityReport should be created after cloning.")

        new_facility_report = FacilityReport.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNotNone(new_facility_report, "A cloned FacilityReport should exist for the new report version.")
        self.assertEqual(new_facility_report.facility, self.old_facility_report.facility)
        self.assertEqual(new_facility_report.facility_name, self.old_facility_report.facility_name)
        self.assertEqual(new_facility_report.facility_type, self.old_facility_report.facility_type)
        self.assertEqual(new_facility_report.facility_bcghgid, self.old_facility_report.facility_bcghgid)
        self.assertFalse(new_facility_report.is_completed, "Cloned FacilityReport should have is_completed=False.")

        self.assertQuerySetEqual(
            new_facility_report.activities.all(), self.old_facility_report.activities.all(), ordered=False
        )

        cloned_report_activity = ReportActivity.objects.filter(facility_report=new_facility_report).first()
        self.assertIsNotNone(cloned_report_activity, "Cloned ReportActivity should exist for the new FacilityReport.")
        self.assertEqual(
            cloned_report_activity.json_data,
            self.old_facility_activity.json_data,
            "The json_data of the cloned ReportActivity should match the original.",
        )

        new_raw_data = ReportRawActivityData.objects.filter(facility_report=new_facility_report).all()
        self.assertEqual(new_raw_data.count(), 1, "There should be one cloned ReportRawActivityData.")
        self.assertEqual(
            new_raw_data[0].json_data,
            self.old_facility_activity_raw_data.json_data,
            "The raw data should have been cloned",
        )

    def test_reapply_emission_categories(self):
        fake_version = MagicMock(spec=ReportVersion)
        fake_methodology = MagicMock(spec=ReportMethodology)
        fake_emission = MagicMock(spec=ReportEmission)
        fake_emission.report_source_type = MagicMock()
        fake_emission.report_fuel = MagicMock()
        fake_emission.report_methodology = fake_methodology

        with (
            patch("reporting.models.ReportEmission.objects.filter") as mock_filter,
            patch(
                "reporting.service.report_supplementary_version_service.report_supplementary_version_service.EmissionCategoryMappingService.apply_emission_categories"
            ) as mock_apply,
            patch(
                "reporting.service.report_supplementary_version_service.report_supplementary_version_service.model_to_dict"
            ) as mock_model_to_dict,
        ):
            mock_filter.return_value.select_related.return_value = [fake_emission]
            mock_model_to_dict.return_value = {
                'report_source_type': fake_emission.report_source_type,
                'report_fuel': fake_emission.report_fuel,
                'report_methodology': fake_methodology,
            }

            ReportSupplementaryVersionService.reapply_emission_categories(fake_version)

            mock_filter.assert_called_once_with(report_version=fake_version)
            mock_apply.assert_called_once_with(
                report_source_type=fake_emission.report_source_type,
                report_fuel=fake_emission.report_fuel,
                report_emission=fake_emission,
                methodology_data={
                    'report_source_type': fake_emission.report_source_type,
                    'report_fuel': fake_emission.report_fuel,
                    'report_methodology': fake_methodology,
                },
            )
