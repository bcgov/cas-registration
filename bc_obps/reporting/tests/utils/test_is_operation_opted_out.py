import pytest
from registration.models import Operation
from reporting.utils import is_operation_opted_out


@pytest.mark.parametrize(
    "reporting_year,registration_purpose,operation_opted_out_final_reporting_year,expected",
    [
        (2025, Operation.Purposes.OPTED_IN_OPERATION, 2025, True),
        (2026, Operation.Purposes.OPTED_IN_OPERATION, 2025, True),
        (2025, Operation.Purposes.OBPS_REGULATED_OPERATION, 2025, False),
        (2025, Operation.Purposes.OPTED_IN_OPERATION, None, False),
        (2024, Operation.Purposes.OPTED_IN_OPERATION, 2025, False),
        (2025, None, 2025, False),
    ],
)
def test_is_operation_opted_out(
    reporting_year,
    registration_purpose,
    operation_opted_out_final_reporting_year,
    expected,
):
    assert (
        is_operation_opted_out(
            reporting_year=reporting_year,
            registration_purpose=registration_purpose,
            operation_opted_out_final_reporting_year=operation_opted_out_final_reporting_year,
        )
        is expected
    )
