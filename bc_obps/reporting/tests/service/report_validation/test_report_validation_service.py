from model_bakery.baker import make_recipe
import pytest
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)

pytestmark = pytest.mark.django_db


class TestReportValidationService:
    def test_abc_abc(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        result = ReportValidationService.validate_report_version(report_version.id)

        assert result == 1
