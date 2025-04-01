from django.test import TestCase
from model_bakery.baker import make_recipe
from django.core.files.base import ContentFile
from registration.models import Operation
from reporting.tests.service.test_report_activity_save_service import data
from reporting.service.report_supplementary_version_service import ReportSupplementaryVersionService
from reporting.models import (
    FacilityReport,
    ReportActivity,
    ReportAdditionalData,
    ReportAttachment,
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


class ReportSupplementaryVersionServiceTests(TestCase):
    def setUp(self):
        # Create old and new ReportVersion instances
        self.old_report_version = make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Submitted,
            is_latest_submitted=True,
        )
        self.new_report_version = make_recipe('reporting.tests.utils.report_version')

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
        self.old_facility_report = make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.old_report_version
        )

        # Create a ReportActivity for the old FacilityReport with realistic test data
        self.old_facility_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=self.old_facility_report,
            report_version=self.old_report_version,
            json_data=data.test_data,
        )

        # Create a ReportRawActivityData for self.old_facility_activity
        self.old_facility_activity = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report=self.old_facility_activity.facility_report,
            activity=self.old_facility_activity.activity,
            json_data=self.old_facility_activity.json_data,
        )

    def test_create_report_supplementary_version(self):
        # ACT: Call the method to create a supplementary version.
        new_version = ReportSupplementaryVersionService.create_report_supplementary_version(self.old_report_version.id)

        # ASSERT: Verify that the new report version is correctly created.
        # It should have the same report and report_type as the original,
        # but its status should be Draft and is_latest_submitted False.
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

    def test_clone_report_version_operation(self):
        """
        Test that the cloning method for ReportOperation correctly duplicates
        all scalar field values and many-to-many relationships (regulated_products and activities)
        from the old report version to a new report version.
        """
        # PRE-ACT: Assert initial count of ReportOperation is 1.
        initial_count = ReportOperation.objects.count()
        self.assertEqual(initial_count, 1, "There should be one ReportOperation initially.")

        # ACT: Run the cloning method.
        ReportSupplementaryVersionService.clone_report_version_operation(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Verify that a new ReportOperation has been created (count increases from 1 to 2).
        new_count = ReportOperation.objects.count()
        self.assertEqual(new_count, 2, "A new ReportOperation should be created after cloning.")

        # ASSERT: Retrieve both old and new ReportOperation instances.
        old_operation = ReportOperation.objects.get(report_version=self.old_report_version)
        new_operation = ReportOperation.objects.get(report_version=self.new_report_version)

        # ASSERT: Check that scalar fields are copied correctly.
        self.assertEqual(new_operation.operator_legal_name, old_operation.operator_legal_name)
        self.assertEqual(new_operation.operator_trade_name, old_operation.operator_trade_name)
        self.assertEqual(new_operation.operation_name, old_operation.operation_name)
        self.assertEqual(new_operation.operation_type, old_operation.operation_type)
        self.assertEqual(new_operation.registration_purpose, old_operation.registration_purpose)
        self.assertEqual(new_operation.operation_bcghgid, old_operation.operation_bcghgid)
        self.assertEqual(new_operation.bc_obps_regulated_operation_id, old_operation.bc_obps_regulated_operation_id)

        # ASSERT: Verify many-to-many relationships for regulated_products are copied.
        old_regulated_ids = set(old_operation.regulated_products.values_list('id', flat=True))
        new_regulated_ids = set(new_operation.regulated_products.values_list('id', flat=True))
        self.assertEqual(old_regulated_ids, new_regulated_ids)

        # ASSERT: Verify many-to-many relationships for activities are copied.
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

        # ACT: Clone the representatives.
        ReportSupplementaryVersionService.clone_report_version_representatives(
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

        # ACT: Clone the ReportPersonResponsible.
        ReportSupplementaryVersionService.clone_report_version_person_responsible(
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

        # ACT: Clone the ReportAdditionalData.
        ReportSupplementaryVersionService.clone_report_version_additional_data(
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

        # ACT: Clone the ReportNewEntrant data.
        ReportSupplementaryVersionService.clone_report_version_new_entrant_data(
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
        verification = make_recipe(
            'reporting.tests.utils.report_verification',
            report_version=self.old_report_version,
            verification_body_name="Test Verification Body",
            accredited_by=ReportVerification.AccreditedBy.ANAB,
            scope_of_verification=ReportVerification.ScopeOfVerification.BC_OBPS,
            threats_to_independence=True,
            verification_conclusion=ReportVerification.VerificationConclusion.POSITIVE,
        )
        make_recipe(
            'reporting.tests.utils.report_verification_visit',
            report_verification=verification,
            visit_name="Test Visit",
            visit_type=ReportVerificationVisit.VisitType.IN_PERSON,
            visit_coordinates="(10.0, 20.0)",
            is_other_visit=False,
        )

        # ACT: Clone the ReportVerification from old to new report version.
        ReportSupplementaryVersionService.clone_report_version_verification(
            self.old_report_version, self.new_report_version
        )

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
        ReportSupplementaryVersionService.clone_report_version_verification(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Verify that no ReportVerification has been created for the new report version.
        new_verification = ReportVerification.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNone(new_verification)

    def test_clone_report_version_attachments(self):
        """
        Test that clone_report_version_attachments clones all ReportAttachment instances
        from the old report version to the new report version.
        """
        # PRE-ACT: Create two ReportAttachment instances for the old report version.
        make_recipe(
            'reporting.tests.utils.report_attachment',
            report_version=self.old_report_version,
            attachment=ContentFile(b"dummy file content", "file1.pdf"),
            attachment_type="verification_statement",
            attachment_name="Attachment 1",
        )
        make_recipe(
            'reporting.tests.utils.report_attachment',
            report_version=self.old_report_version,
            attachment=ContentFile(b"dummy file content", "file2.doc"),
            attachment_type="wci_352_362",
            attachment_name="Attachment 2",
        )

        # ACT: Clone the ReportAttachment instances.
        ReportSupplementaryVersionService.clone_report_version_attachments(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Verify that two ReportAttachment instances have been cloned.
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
        from the old report version to the new report version using recipes.
        """
        # PRE-ACT: Assert that there is exactly one FacilityReport for the old report version.
        initial_count = FacilityReport.objects.filter(report_version=self.old_report_version).count()
        self.assertEqual(initial_count, 1, "There should be one FacilityReport initially.")

        # ACT: Clone the FacilityReport (and its associated ReportActivity) to the new report version.
        ReportSupplementaryVersionService.clone_report_version_facilities(
            self.old_report_version, self.new_report_version
        )

        # ASSERT: Verify that a new FacilityReport has been created (record count increases from 1 to 2).
        new_count = FacilityReport.objects.count()
        self.assertEqual(new_count, 2, "A new FacilityReport should be created after cloning.")

        # ASSERT: Retrieve the cloned FacilityReport and verify that its scalar fields match the original.
        new_facility_report = FacilityReport.objects.filter(report_version=self.new_report_version).first()
        self.assertIsNotNone(new_facility_report, "A cloned FacilityReport should exist for the new report version.")
        self.assertEqual(new_facility_report.facility, self.old_facility_report.facility)
        self.assertEqual(new_facility_report.facility_name, self.old_facility_report.facility_name)
        self.assertEqual(new_facility_report.facility_type, self.old_facility_report.facility_type)
        self.assertEqual(new_facility_report.facility_bcghgid, self.old_facility_report.facility_bcghgid)
        self.assertFalse(new_facility_report.is_completed, "Cloned FacilityReport should have is_completed=False.")

        # ASSERT: Verify that the associated ReportActivity is cloned.
        cloned_activities = new_facility_report.activities.all()
        self.assertTrue(cloned_activities.exists(), "Cloned FacilityReport should have at least one activity.")
        self.assertIn(
            self.old_facility_activity.activity,
            cloned_activities,
            "The activity from the old ReportActivity should be present on the cloned FacilityReport.",
        )

        # ASSERT: Verify that the ReportActivity ReportRawActivityData is cloned.
        cloned_report_activity = ReportActivity.objects.filter(facility_report=new_facility_report).first()
        self.assertIsNotNone(cloned_report_activity, "Cloned ReportActivity should exist for the new FacilityReport.")
        self.assertEqual(
            cloned_report_activity.json_data,
            self.old_facility_activity.json_data,
            "The json_data of the cloned ReportActivity should match the original.",
        )
