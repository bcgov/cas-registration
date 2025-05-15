import pytest
from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.models import ReportEmission, ReportProduct
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportSupplementaryApi(CommonTestSetup):
    def setup_method(self):
        self.old_report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.new_report_version = baker.make_recipe("reporting.tests.utils.report_version")
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.old_report_version.report.operator)

    @pytest.mark.parametrize(
        "existing_purpose, new_purpose, expected_called_method",
        [
            # Purpose is same → create_report_supplementary_version is called
            (Operation.Purposes.OBPS_REGULATED_OPERATION, Operation.Purposes.OBPS_REGULATED_OPERATION, "supplementary"),
            # Purpose is different → create_report_version is called
            (Operation.Purposes.OBPS_REGULATED_OPERATION, "different-purpose", "new_version"),
        ],
    )
    @patch(
        "reporting.service.report_supplementary_version_service.ReportSupplementaryVersionService"
        ".create_report_supplementary_version"
    )
    @patch("service.report_version_service.ReportVersionService.create_report_version")
    def test_create_version_based_on_purpose(
        self,
        mock_create_report_version: MagicMock,
        mock_create_supplementary: MagicMock,
        existing_purpose,
        new_purpose,
        expected_called_method,
    ):
        report_version = self.old_report_version

        report_version.report.operation.registration_purpose = existing_purpose
        report_version.report.operation.save()

        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            registration_purpose=new_purpose,
        )

        if expected_called_method == "supplementary":
            mock_create_supplementary.return_value = self.new_report_version
        else:
            mock_create_report_version.return_value = self.new_report_version

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy(
                "create_report_supplementary_version",
                kwargs={"version_id": report_version.id},
            ),
        )

        assert response.status_code == 201
        assert response.json() == self.new_report_version.id

        if expected_called_method == "supplementary":
            mock_create_supplementary.assert_called_once_with(report_version.id)
            mock_create_report_version.assert_not_called()
        else:
            mock_create_report_version.assert_called_once_with(report_version.report)
            mock_create_supplementary.assert_not_called()

    def test_new_version_has_no_emission_or_product_records(self):
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.old_report_version,
            registration_purpose="different-purpose",
        )
        baker.make_recipe("reporting.tests.utils.report_emission", report_version=self.old_report_version, _quantity=3)

        facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.old_report_version,
        )
        baker.make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.old_report_version,
            facility_report=facility_report,
            product_id=1,
        )

        self.old_report_version.status = "Submitted"
        self.old_report_version.save()

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy(
                "create_report_supplementary_version",
                kwargs={"version_id": self.old_report_version.id},
            ),
        )
        assert response.status_code == 201
        new_report_version_id = response.json()
        # Verify that the new report version has no related entries
        assert not ReportEmission.objects.filter(report_version_id=new_report_version_id).exists()
        assert not ReportProduct.objects.filter(report_version_id=new_report_version_id).exists()

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_returns_data_as_provided_by_is_initial_version(self, mock_is_initial_report_version: MagicMock):
        is_initial = True
        mock_is_initial_report_version.return_value = is_initial
        expected_response = {"is_supplementary_report_version": not is_initial}

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "is_supplementary_report_version",
                kwargs={"version_id": self.old_report_version.id},
            ),
        )

        assert response.status_code == 200
        assert response.json() == expected_response
        mock_is_initial_report_version.assert_called_once_with(self.old_report_version.id)

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("create_report_supplementary_version", method="post")
        assert_report_version_ownership_is_validated("is_supplementary_report_version")
