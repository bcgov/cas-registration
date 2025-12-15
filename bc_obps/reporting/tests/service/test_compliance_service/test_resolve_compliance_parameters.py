import unittest
from decimal import Decimal

from reporting.service.compliance_service_parameters import resolve_compliance_parameters


class TestResolveComplianceParameters(unittest.TestCase):
    def test_apr_dec_prorates_correctly(self):
        # allocated 100 over annual 1000, apr-dec production 100 => prorated = (100/1000)*100 = 10
        production_totals = {"annual_amount": Decimal("1000"), "apr_dec": Decimal("100")}
        production_for_limit, allocated_2024, allocated_value = resolve_compliance_parameters(
            use_apr_dec=True, allocated_for_compliance=Decimal("100"), production_totals=production_totals
        )

        self.assertEqual(production_for_limit, Decimal("100"))
        # raw prorated value
        self.assertEqual(allocated_2024, Decimal("10"))
        # rounded value used for product reporting
        self.assertEqual(allocated_value, Decimal("10.0000"))

    def test_apr_dec_with_zero_annual_returns_zero_prorated(self):
        production_totals = {"annual_amount": Decimal("0"), "apr_dec": Decimal("50")}
        production_for_limit, allocated_2024, allocated_value = resolve_compliance_parameters(
            use_apr_dec=True, allocated_for_compliance=Decimal("100"), production_totals=production_totals
        )

        # production_for_limit should be apr-dec value even if annual is zero
        self.assertEqual(production_for_limit, Decimal("50"))
        # prorated allocated should be zero to avoid division by zero
        self.assertEqual(allocated_2024, Decimal("0"))
        self.assertEqual(allocated_value, Decimal("0.0000"))

    def test_non_apr_dec_uses_full_year_and_rounds_allocated(self):
        production_totals = {"annual_amount": Decimal("2000"), "apr_dec": Decimal("100")}
        allocated = Decimal("123.45678")
        production_for_limit, allocated_2024, allocated_value = resolve_compliance_parameters(
            use_apr_dec=False, allocated_for_compliance=allocated, production_totals=production_totals
        )

        # full-year production used
        self.assertEqual(production_for_limit, Decimal("2000"))
        # no apr-dec prorated allocation
        self.assertEqual(allocated_2024, Decimal("0"))
        # allocated value rounded to 4 decimal places
        expected_rounded = Decimal(allocated).quantize(Decimal("0.0001"), rounding="ROUND_HALF_UP")
        self.assertEqual(allocated_value, expected_rounded)
