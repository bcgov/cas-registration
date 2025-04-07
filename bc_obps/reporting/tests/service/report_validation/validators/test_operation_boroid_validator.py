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
            registration_purpose="New Entrant Operation",
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
            registration_purpose="New Entrant Operation",
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_boro_id": ReportValidationError(
                Severity.ERROR,
                "Report is missing BORO ID, please make sure one has been assigned to your operation.",
            )
        }

    @pytest.mark.parametrize(
        "reg_purpose, boro_required",
        [
            ("Reporting Operation", False),
            ("OBPS Regulated Operation", True),
            ("Opted-in Operation", True),
            ("New Entrant Operation", True),
            ("Electricity Import Operation", False),
            ("Potential Reporting Operation", False),
        ],
    )
    def test_succeeds_if_boro_id_required(self, reg_purpose, boro_required):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id="british columbia",
            registration_purpose=reg_purpose,
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert bool(result) == boro_required
