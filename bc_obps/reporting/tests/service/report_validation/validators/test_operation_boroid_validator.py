from model_bakery.baker import make_recipe
import pytest
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators import (
    operation_boroid_presence,
)


@pytest.mark.django_db
class TestOperationBoroBcghgidValidator:
    def test_error_if_no_boro_id(self):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id=None,
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_boro_id": ReportValidationError(
                Severity.ERROR,
                "Report is missing BORO ID, please make sure one has been assigned to your operation.",
            )
        }

    def test_error_if_boro_id_is_empty(self):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id="",
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_boro_id": ReportValidationError(
                Severity.ERROR,
                "Report is missing BORO ID, please make sure one has been assigned to your operation.",
            )
        }

    def test_succeeds_if_boro_and_bcghgid(self):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id="british columbia",
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert not result
