import pytest
from registration.models import Operation
from reporting.utils import (
    is_operation_opted_out,
    should_include_jan_mar_production,
)


@pytest.mark.parametrize(
    "reporting_year,registration_purpose,operation_opted_out_final_reporting_year,expected",
    [
        pytest.param(
            2025,
            Operation.Purposes.OPTED_IN_OPERATION,
            2025,
            True,
            id="opted-out-in-final-year",
        ),
        pytest.param(
            2026,
            Operation.Purposes.OPTED_IN_OPERATION,
            2025,
            True,
            id="opted-out-after-final-year",
        ),
        pytest.param(
            2025,
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            2025,
            False,
            id="non-opted-in-operation",
        ),
        pytest.param(
            2025,
            Operation.Purposes.OPTED_IN_OPERATION,
            None,
            False,
            id="missing-final-reporting-year",
        ),
        pytest.param(
            2024,
            Operation.Purposes.OPTED_IN_OPERATION,
            2025,
            False,
            id="before-final-reporting-year",
        ),
        pytest.param(
            2025,
            None,
            2025,
            False,
            id="missing-registration-purpose",
        ),
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


@pytest.mark.parametrize(
    "reporting_year,registration_purpose,operation_opted_out_final_reporting_year,expected",
    [
        pytest.param(
            2025,
            Operation.Purposes.OPTED_IN_OPERATION,
            2025,
            True,
            id="include-jan-mar-for-2025-opt-out",
        ),
        pytest.param(
            2026,
            Operation.Purposes.OPTED_IN_OPERATION,
            2025,
            False,
            id="do-not-include-jan-mar-after-2025",
        ),
        pytest.param(
            2024,
            Operation.Purposes.OPTED_IN_OPERATION,
            2025,
            False,
            id="do-not-include-jan-mar-before-2025",
        ),
        pytest.param(
            2025,
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            2025,
            False,
            id="do-not-include-jan-mar-for-non-opted-in-operation",
        ),
        pytest.param(
            2025,
            Operation.Purposes.OPTED_IN_OPERATION,
            None,
            False,
            id="do-not-include-jan-mar-without-final-reporting-year",
        ),
        pytest.param(
            2025,
            None,
            2025,
            False,
            id="do-not-include-jan-mar-without-registration-purpose",
        ),
    ],
)
def test_should_include_jan_mar_production(
    reporting_year,
    registration_purpose,
    operation_opted_out_final_reporting_year,
    expected,
):
    assert (
        should_include_jan_mar_production(
            reporting_year=reporting_year,
            registration_purpose=registration_purpose,
            operation_opted_out_final_reporting_year=operation_opted_out_final_reporting_year,
        )
        is expected
    )
