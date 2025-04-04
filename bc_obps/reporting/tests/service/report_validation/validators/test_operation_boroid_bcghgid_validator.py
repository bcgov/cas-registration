from model_bakery.baker import make_recipe
import pytest
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators import (
    operation_boroid_bcghgid_presence,
)


@pytest.mark.django_db
class TestOperationBoroBcghgidValidator:
    def test_error_if_no_boro_id(self):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            operation_bcghgid="bcghg",
            bc_obps_regulated_operation_id=None,
        )

        result = operation_boroid_bcghgid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_boro_id": ReportValidationError(
                Severity.ERROR,
                "Report is missing BORO ID, please make sure one has been assigned to your operation.",
            )
        }

    def test_error_if_no_bcghgid(self):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            operation_bcghgid=None,
            bc_obps_regulated_operation_id="boro",
        )

        result = operation_boroid_bcghgid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_bcghgid": ReportValidationError(
                Severity.ERROR,
                "Report is missing a BCGHGID for the operation, please make sure one has been assigned.",
            )
        }

    def test_succeeds_if_boro_and_bcghgid(self):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            operation_bcghgid="british",
            bc_obps_regulated_operation_id="columbia",
        )

        result = operation_boroid_bcghgid_presence.validate(report_operation.report_version)
        assert not result
