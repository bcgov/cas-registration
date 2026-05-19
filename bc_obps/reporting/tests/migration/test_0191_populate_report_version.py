from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase
from model_bakery import baker


class TestPopulateReportVersionMigration(TransactionTestCase):
    def test_populates_report_version_from_parent_records_with_mock_data(self):
        executor = MigrationExecutor(connection)
        original_targets = executor.loader.graph.leaf_nodes()
        previous_target = ("reporting", "0190_update_diesel_and_natural_gas_fuel_amount_ranges")
        migration_target = (
            "reporting",
            "0191_add_report_version_to_report_models_missing_it",
        )

        try:
            executor.migrate([previous_target])
            pre_migration_apps = executor.loader.project_state([previous_target]).apps

            report_version_one = baker.make_recipe("reporting.tests.utils.report_version")
            report_version_two = baker.make_recipe("reporting.tests.utils.report_version")

            report_new_entrant = baker.make_recipe(
                "reporting.tests.utils.report_new_entrant",
                report_version=report_version_one,
            )
            facility_report = baker.make_recipe(
                "reporting.tests.utils.facility_report",
                report_version=report_version_two,
            )

            activity = baker.make_recipe("registration.tests.utils.activity")
            emission_category = baker.make_recipe("reporting.tests.utils.emission_category")
            regulated_product = baker.make_recipe("registration.tests.utils.regulated_product")

            ReportNewEntrantEmission = pre_migration_apps.get_model("reporting", "ReportNewEntrantEmission")
            ReportNewEntrantProduction = pre_migration_apps.get_model("reporting", "ReportNewEntrantProduction")
            ReportRawActivityData = pre_migration_apps.get_model("reporting", "ReportRawActivityData")

            report_new_entrant_emission = ReportNewEntrantEmission.objects.create(
                report_new_entrant_id=report_new_entrant.pk,
                emission_category_id=emission_category.pk,
                emission="1.0000",
            )
            report_new_entrant_production = ReportNewEntrantProduction.objects.create(
                report_new_entrant_id=report_new_entrant.pk,
                product_id=regulated_product.pk,
                production_amount="2.0000",
            )
            report_raw_activity_data = ReportRawActivityData.objects.create(
                facility_report_id=facility_report.pk,
                activity_id=activity.pk,
                json_data={"test": "raw activity data"},
            )

            executor = MigrationExecutor(connection)
            executor.migrate([migration_target])
            post_migration_apps = executor.loader.project_state([migration_target]).apps

            ReportNewEntrantEmission = post_migration_apps.get_model("reporting", "ReportNewEntrantEmission")
            ReportNewEntrantProduction = post_migration_apps.get_model("reporting", "ReportNewEntrantProduction")
            ReportRawActivityData = post_migration_apps.get_model("reporting", "ReportRawActivityData")

            self.assertEqual(
                ReportNewEntrantEmission.objects.get(pk=report_new_entrant_emission.pk).report_version_id,
                report_new_entrant.report_version_id,
            )
            self.assertEqual(
                ReportNewEntrantProduction.objects.get(pk=report_new_entrant_production.pk).report_version_id,
                report_new_entrant.report_version_id,
            )
            self.assertEqual(
                ReportRawActivityData.objects.get(pk=report_raw_activity_data.pk).report_version_id,
                facility_report.report_version_id,
            )
        finally:
            executor = MigrationExecutor(connection)
            executor.migrate(original_targets)
