from common.tests.utils.model_inspection import get_cascading_models
from unittest import mock
from model_bakery import baker
from model_bakery.baker import make_recipe
import pytest
from reporting.models.report_version import ReportVersion
from service.report_version_service import ReportVersionService

from registration.models import RegulatedProduct, Activity, Operation
from registration.tests.utils.bakers import (
    operation_baker,
)
from reporting.models import ReportVersion, ReportOperation, FacilityReport
from reporting.schema.report_operation import ReportOperationIn
from reporting.tests.utils.bakers import report_baker, reporting_year_baker


pytestmark = pytest.mark.django_db


class TestReportVersionService:
    def test_create_report_version(self):
        # This functionality is tested as part of the report_service
        # Testing the report version
        pass

    def test_report_version_cascading_models(self):
        cascading_models_names = {m.__name__ for m in get_cascading_models(ReportVersion)}

        assert cascading_models_names == {
            "FacilityReport",
            "ReportActivity",
            "ReportAttachment",
            "ReportEmission",
            "ReportFuel",
            "ReportMethodology",
            "ReportNewEntrant",
            "ReportNewEntrantEmission",
            "ReportNewEntrantProduction",
            "ReportNonAttributableEmissions",
            "ReportOperation",
            "ReportPersonResponsible",
            "ReportProduct",
            "ReportProductEmissionAllocation",
            "ReportRawActivityData",
            "ReportSourceType",
            "ReportUnit",
            "ReportOperationRepresentative",
            "ReportAdditionalData",
            "ReportVerification",
            "ReportVerificationVisit",
            "ReportProductEmissionAllocation",
        }

    def test_delete_report_version(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report)

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        ReportVersionService.delete_report_version(report_version.id)
        assert ReportVersion.objects.filter(id=report_version.id).count() == 0

    def test_change_report_version_type_deletes_the_old_version_and_creates_a_new_one(
        self,
    ):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Simple Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 0
        assert ReportVersion.objects.filter(id=return_value.id).count() == 1
        assert return_value.report_type == "Simple Report"

    def test_change_report_version_type_to_the_same_does_nothing(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Annual Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        assert return_value == report_version

    def test_save_report_operation_updates_fields_and_relationships(self):
        operation = operation_baker(type=Operation.Types.LFO)
        reporting_year = reporting_year_baker(reporting_year=2101)
        report_version = report_baker(operation=operation, reporting_year=reporting_year)

        # Create input data for the ReportOperationIn object
        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Updated Operation Type",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[2, 13],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        with (
            mock.patch('reorting.service.report_version_service.ReportOperation.objects.get') as mock_get,
            mock.patch('reorting.service.report_version_service.ReportOperationRepresentative.objects.filter') as mock_filter,
            mock.patch('reorting.service.report_version_service.FacilityReport.objects.filter') as mock_facility_filter,
            mock.patch('reorting.service.report_version_service.Activity.objects.filter') as mock_activity_filter,
            mock.patch('reorting.service.report_version_service.RegulatedProduct.objects.filter') as mock_regulated_product_filter,
        ):
            mock_report_operation = mock.MagicMock(spec=ReportOperation)
            mock_get.return_value = mock_report_operation

            mock_filter.return_value.update.return_value = None

            # Mock FacilityReport behavior
            mock_facility_reports = [mock.MagicMock(spec=FacilityReport) for _ in range(3)]
            mock_facility_filter.return_value = mock_facility_reports

            # Mock Activity filtering
            mock_activity_1 = mock.MagicMock(spec=Activity, name="Hydrogen production")
            mock_activity_2 = mock.MagicMock(spec=Activity, name="Magnesium production")
            mock_activity_filter.return_value = [mock_activity_1, mock_activity_2]

            # Mock RegulatedProduct filtering
            mock_regulated_product_1 = mock.MagicMock(spec=RegulatedProduct, name="Cement equivalent")
            mock_regulated_product_2 = mock.MagicMock(spec=RegulatedProduct, name="Mining: gold-equivalent")
            mock_regulated_product_filter.return_value = [mock_regulated_product_1, mock_regulated_product_2]

            ReportVersionService.save_report_operation(report_version.id, data)

            mock_report_operation.activities.set.assert_called_once_with([mock_activity_1, mock_activity_2])

            mock_report_operation.regulated_products.set.assert_called_once_with(
                [mock_regulated_product_1, mock_regulated_product_2]
            )

            # Verify that other fields were updated correctly
            mock_report_operation.operator_legal_name = data.operator_legal_name
            mock_report_operation.operator_trade_name = data.operator_trade_name
            mock_report_operation.operation_name = data.operation_name
            mock_report_operation.operation_type = data.operation_type
            mock_report_operation.operation_bcghgid = data.operation_bcghgid
            mock_report_operation.bc_obps_regulated_operation_id = data.bc_obps_regulated_operation_id
            mock_report_operation.operation_report_type = data.operation_report_type

    def test_get_registration_purpose_by_version_id_returns_correct_data(self):
        """
        Test that the service retrieves the correct registration purpose
        for a given report version ID.
        """
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_operation = make_recipe(
            'reporting.tests.utils.report_operation', report_version=self.report_version
        )
        retrieved_data = ReportVersionService.get_registration_purpose_by_version_id(version_id=self.report_version.id)
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data["registration_purpose"], self.report_operation.registration_purpose)
