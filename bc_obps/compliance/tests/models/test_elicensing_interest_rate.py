from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from datetime import date
from django.core.exceptions import ValidationError
from compliance.models.elicensing_interest_rate import ElicensingInterestRate


class ElicensingInterestRateTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.elicensing_interest_rate')
        cls.field_data = [
            ("id", "ID", None, None),
            ("interest_rate", "interest rate", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
            ("is_current_rate", "is current rate", None, None),
        ]
        # Clear any existing data otherwise uniqueness constraints will fail
        ElicensingInterestRate.objects.all().delete()

    def test_overlap_constraint_prevents_overlapping_periods(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=False,
        )

        with self.assertRaises(ValidationError):
            rate2 = make_recipe(
                'compliance.tests.utils.elicensing_interest_rate',
                start_date=date(2024, 2, 1),
                end_date=date(2024, 4, 30),
                is_current_rate=False,
            )  # Overlaps with first period
            rate2.full_clean()
            rate2.save()

    def test_adjacent_periods_allowed(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=False,
        )

        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 4, 1),
            end_date=date(2024, 6, 30),
            is_current_rate=False,
        )  # Adjacent to first period

        self.assertEqual(ElicensingInterestRate.objects.count(), 2)

    def test_unique_current_rate_constraint_allows_multiple_false(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=False,
        )
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 4, 1),
            end_date=date(2024, 6, 30),
            is_current_rate=False,
        )
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 7, 1),
            end_date=date(2024, 9, 30),
            is_current_rate=False,
        )
        self.assertEqual(ElicensingInterestRate.objects.count(), 3)
        self.assertEqual(ElicensingInterestRate.objects.filter(is_current_rate=False).count(), 3)

    def test_unique_current_rate_constraint_allows_one_true(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=True,
        )
        self.assertEqual(ElicensingInterestRate.objects.count(), 1)
        self.assertEqual(ElicensingInterestRate.objects.filter(is_current_rate=True).count(), 1)

    def test_unique_current_rate_constraint_prevents_multiple_true(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=True,
        )

        with self.assertRaises(ValidationError):
            make_recipe(
                'compliance.tests.utils.elicensing_interest_rate',
                start_date=date(2024, 4, 1),
                end_date=date(2024, 6, 30),
                is_current_rate=True,
            )

    def test_unique_current_rate_constraint_prevents_updating_to_true_when_exists(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=True,
        )
        rate2 = make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 4, 1),
            end_date=date(2024, 6, 30),
            is_current_rate=False,
        )

        with self.assertRaises(ValidationError):
            rate2.is_current_rate = True
            rate2.save()

    def test_exact_overlap(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=False,
        )
        with self.assertRaises(ValidationError):
            rate2 = make_recipe(
                'compliance.tests.utils.elicensing_interest_rate',
                start_date=date(2024, 1, 1),
                end_date=date(2024, 3, 31),
                is_current_rate=False,  # Exact same start date  # Exact same end date
            )
            rate2.full_clean()
            rate2.save()

    def test_partial_overlap_start(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=False,
        )

        with self.assertRaises(ValidationError):
            rate2 = make_recipe(
                'compliance.tests.utils.elicensing_interest_rate',
                start_date=date(2023, 12, 1),  # Starts before first period
                end_date=date(2024, 2, 15),  # Ends during first period
                is_current_rate=False,
            )
            rate2.full_clean()
            rate2.save()

    def test_partial_overlap_end(self):
        make_recipe(
            'compliance.tests.utils.elicensing_interest_rate',
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            is_current_rate=False,
        )

        with self.assertRaises(ValidationError):
            rate2 = make_recipe(
                'compliance.tests.utils.elicensing_interest_rate',
                start_date=date(2024, 2, 15),  # Starts during first period
                end_date=date(2024, 4, 30),  # Ends after first period
                is_current_rate=False,
            )
            rate2.full_clean()
            rate2.save()
