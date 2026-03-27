import pytest

from registration.models import Operation
from reporting.service.utils import (
    OperationContext,
    is_operation_opted_out,
    should_include_jan_mar_production,
)


@pytest.mark.parametrize(
    "ctx, expected",
    [
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2025,
            ),
            True,
            id="opted-out-in-final-year",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2026,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2025,
            ),
            True,
            id="opted-out-after-final-year",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
                opted_out_final_year=2025,
            ),
            False,
            id="non-opted-in-operation",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=None,
            ),
            False,
            id="missing-final-reporting-year",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2024,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2025,
            ),
            False,
            id="before-final-reporting-year",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=None,
                opted_out_final_year=2025,
            ),
            False,
            id="missing-registration-purpose",
        ),
    ],
)
def test_is_operation_opted_out(ctx, expected):
    assert is_operation_opted_out(ctx) is expected


@pytest.mark.parametrize(
    "ctx, expected",
    [
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2025,
            ),
            True,
            id="include-jan-mar-for-2025-opt-out",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2024,
            ),
            True,
            id="include-jan-mar-for-2025-when-final-year-was-before-2025",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2026,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2025,
            ),
            False,
            id="do-not-include-jan-mar-after-2025",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2024,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=2025,
            ),
            False,
            id="do-not-include-jan-mar-before-2025",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
                opted_out_final_year=2025,
            ),
            False,
            id="do-not-include-jan-mar-for-non-opted-in-operation",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
                opted_out_final_year=None,
            ),
            False,
            id="do-not-include-jan-mar-without-final-reporting-year",
        ),
        pytest.param(
            OperationContext(
                reporting_year=2025,
                registration_purpose=None,
                opted_out_final_year=2025,
            ),
            False,
            id="do-not-include-jan-mar-without-registration-purpose",
        ),
    ],
)
def test_should_include_jan_mar_production(ctx, expected):
    assert should_include_jan_mar_production(ctx) is expected
