from model_bakery.baker import make_recipe
import pytest
from registration.models.operation import Operation
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators import (
    operation_boroid_presence,
)


boro_required_purposes = [
    Operation.Purposes.OBPS_REGULATED_OPERATION,
    Operation.Purposes.OPTED_IN_OPERATION,
    Operation.Purposes.NEW_ENTRANT_OPERATION,
]

boro_not_required_purposes = [
    Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
    Operation.Purposes.REPORTING_OPERATION,
    Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
]


@pytest.mark.django_db
class TestOperationBoroIdValidator:
    def test_all_purposes_are_evaluated(self):
        # Ensure we cover all the registration purposes
        assert set(boro_required_purposes).union(boro_not_required_purposes) == set(Operation.Purposes)

    @pytest.mark.parametrize(
        "reg_purpose",
        boro_required_purposes,
    )
    def test_error_if_no_boro_id(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id=None,
            registration_purpose=reg_purpose,
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_boro_id": ReportValidationError(
                Severity.ERROR,
                "Report is missing BORO ID, please make sure one has been assigned to your operation.",
            )
        }

    @pytest.mark.parametrize(
        "reg_purpose",
        boro_required_purposes,
    )
    def test_error_if_boro_id_is_empty(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id="",
            registration_purpose=reg_purpose,
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert result == {
            "operation_boro_id": ReportValidationError(
                Severity.ERROR,
                "Report is missing BORO ID, please make sure one has been assigned to your operation.",
            )
        }

    @pytest.mark.parametrize("reg_purpose", list(Operation.Purposes))
    def test_succeeds_if_boro_id_present(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id="british columbia",
            registration_purpose=reg_purpose,
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert not result

    @pytest.mark.parametrize(
        "reg_purpose",
        boro_not_required_purposes,
    )
    def test_succeeds_if_boro_id_not_required(self, reg_purpose):
        report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            bc_obps_regulated_operation_id=None,
            registration_purpose=reg_purpose,
        )

        result = operation_boroid_presence.validate(report_operation.report_version)
        assert not result
