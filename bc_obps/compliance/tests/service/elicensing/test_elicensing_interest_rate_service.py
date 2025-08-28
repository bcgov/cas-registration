import pytest
from unittest.mock import patch
from decimal import Decimal
from datetime import date
from compliance.models.elicensing_interest_rate import ElicensingInterestRate
from compliance.service.elicensing.elicensing_interest_rate_service import ElicensingInterestRateService
from compliance.service.elicensing.schema import InterestRatePeriod, InterestRateResponse
from compliance.service.elicensing.elicensing_api_client import elicensing_api_client

pytestmark = pytest.mark.django_db


@pytest.fixture
def run_refresh_with_mock_data():
    def _run_refresh_with_mock_data(*period_data):
        periods = [
            InterestRatePeriod(rate=Decimal(str(rate)), startDate=start_date) for rate, start_date in period_data
        ]
        mock_response = InterestRateResponse(daysPerYear=Decimal('365'), periods=periods)
        with patch.object(elicensing_api_client, 'get_interest_rates', return_value=mock_response):
            ElicensingInterestRateService.refresh_interest_rates()

    return _run_refresh_with_mock_data


@pytest.fixture
def assert_record_state():
    def _assert_record_state(start_date, expected_rate=None, expected_end_date=None, expected_is_current=None):
        record = ElicensingInterestRate.objects.get(start_date=start_date)
        if expected_rate is not None:
            assert record.interest_rate == Decimal(str(expected_rate))
        if expected_end_date is not None:
            assert record.end_date == expected_end_date
        if expected_is_current is not None:
            assert record.is_current_rate == expected_is_current
        return record

    return _assert_record_state


@pytest.fixture
def create_existing_record():
    def _create_existing_record(start_date, rate, end_date=None, is_current=False):
        if end_date is None:
            end_date = ElicensingInterestRateService.FAR_FUTURE_DATE
        return ElicensingInterestRate.objects.create(
            start_date=start_date,
            interest_rate=Decimal(str(rate)),
            end_date=end_date,
            is_current_rate=is_current,
        )

    return _create_existing_record


@pytest.fixture
def standard_period_data():
    return ('4.56', '2025-01-01'), ('6.78', '2025-07-01')


@pytest.fixture
def mock_api_client():
    with patch.object(elicensing_api_client, 'get_interest_rates') as mock:
        yield mock


class TestElicensingInterestRateService:
    def test_refresh_interest_rates_success(
        self, run_refresh_with_mock_data, assert_record_state, standard_period_data
    ):
        run_refresh_with_mock_data(*standard_period_data)

        # Verify records were created
        assert ElicensingInterestRate.objects.count() == 2

        # First period
        assert_record_state(
            date(2025, 1, 1), expected_rate='0.045600', expected_end_date=date(2025, 6, 30), expected_is_current=False
        )

        # Second period
        assert_record_state(
            date(2025, 7, 1),
            expected_rate='0.067800',
            expected_end_date=ElicensingInterestRateService.FAR_FUTURE_DATE,
            expected_is_current=True,
        )

    def test_refresh_interest_rates_filters_before_cutoff(self, run_refresh_with_mock_data, assert_record_state):
        run_refresh_with_mock_data(('3.25', '2024-12-01'), ('4.56', '2025-01-01'))  # Before cutoff  # After cutoff

        assert ElicensingInterestRate.objects.count() == 1
        assert_record_state(date(2025, 1, 1), expected_rate='0.045600')

    def test_refresh_interest_rates_empty_periods(self, run_refresh_with_mock_data):
        run_refresh_with_mock_data()  # No periods
        assert ElicensingInterestRate.objects.count() == 0

    def test_refresh_interest_rates_all_before_cutoff(self, run_refresh_with_mock_data):
        run_refresh_with_mock_data(('3.25', '2024-12-01'), ('2.95', '2024-11-01'))
        assert ElicensingInterestRate.objects.count() == 0

    def test_refresh_interest_rates_sorts_periods(self, run_refresh_with_mock_data):
        run_refresh_with_mock_data(
            ('6.78', '2025-07-01'), ('4.56', '2025-01-01')  # Later date first  # Earlier date second
        )

        # Records should be created in chronological order
        records = ElicensingInterestRate.objects.order_by('start_date')
        assert records[0].start_date == date(2025, 1, 1)
        assert records[1].start_date == date(2025, 7, 1)

    def test_refresh_interest_rates_skips_existing_periods(
        self, create_existing_record, run_refresh_with_mock_data, assert_record_state
    ):
        existing_record = create_existing_record(date(2025, 1, 1), '0.045600', date(2025, 6, 30), False)

        run_refresh_with_mock_data(('4.56', '2025-01-01'), ('6.78', '2025-07-01'))  # Already exists # New period

        # Should have 2 records (existing + new)
        assert ElicensingInterestRate.objects.count() == 2

        # Existing record should remain unchanged
        existing_record.refresh_from_db()
        assert existing_record.interest_rate == Decimal('0.045600')
        assert existing_record.end_date == date(2025, 6, 30)
        assert existing_record.is_current_rate is False

        # The new record should be marked as current
        assert_record_state(date(2025, 7, 1), expected_is_current=True)

    def test_refresh_interest_rates_updates_previous_period_end_dates(self, mock_api_client):
        mock_periods = [
            InterestRatePeriod(rate=Decimal('4.56'), startDate='2025-01-01'),
            InterestRatePeriod(rate=Decimal('6.78'), startDate='2025-07-01'),
            InterestRatePeriod(rate=Decimal('7.25'), startDate='2026-01-01'),
        ]
        mock_response = InterestRateResponse(daysPerYear=Decimal('365'), periods=mock_periods)
        mock_api_client.return_value = mock_response

        ElicensingInterestRateService.refresh_interest_rates()

        # Check that end dates are properly calculated
        first_record = ElicensingInterestRate.objects.get(start_date=date(2025, 1, 1))
        assert first_record.end_date == date(2025, 6, 30)  # One day before the second period

        second_record = ElicensingInterestRate.objects.get(start_date=date(2025, 7, 1))
        assert second_record.end_date == date(2025, 12, 31)  # One day before the third period

        third_record = ElicensingInterestRate.objects.get(start_date=date(2026, 1, 1))
        assert third_record.end_date == ElicensingInterestRateService.FAR_FUTURE_DATE
        mock_api_client.assert_called_once()

    def test_refresh_interest_rates_resets_current_rate_flags(self, mock_api_client):
        ElicensingInterestRate.objects.create(
            start_date=date(2024, 1, 1),
            interest_rate=Decimal('0.032500'),
            end_date=date(2024, 12, 31),
            is_current_rate=True,
        )

        mock_periods = [
            InterestRatePeriod(rate=Decimal('4.56'), startDate='2025-01-01'),
        ]
        mock_response = InterestRateResponse(daysPerYear=Decimal('365'), periods=mock_periods)
        mock_api_client.return_value = mock_response

        ElicensingInterestRateService.refresh_interest_rates()

        assert ElicensingInterestRate.objects.filter(is_current_rate=True).count() == 1
        # Only the new record should be current
        new_record = ElicensingInterestRate.objects.get(start_date=date(2025, 1, 1))
        assert new_record.is_current_rate is True

    def test_refresh_interest_rates_api_error(self):
        with patch.object(elicensing_api_client, 'get_interest_rates', side_effect=Exception("API Error")):
            with pytest.raises(Exception):
                ElicensingInterestRateService.refresh_interest_rates()

        # No records should be created on error
        assert ElicensingInterestRate.objects.count() == 0

    def test_refresh_interest_rates_multiple_runs_maintains_current_flag(
        self, run_refresh_with_mock_data, assert_record_state, standard_period_data
    ):
        # First run
        run_refresh_with_mock_data(*standard_period_data)
        assert ElicensingInterestRate.objects.count() == 2
        assert_record_state(date(2025, 1, 1), expected_is_current=False)
        assert_record_state(date(2025, 7, 1), expected_is_current=True)

        # Second run with the same data
        run_refresh_with_mock_data(*standard_period_data)
        assert ElicensingInterestRate.objects.count() == 2
        assert_record_state(date(2025, 1, 1), expected_is_current=False)
        assert_record_state(date(2025, 7, 1), expected_is_current=True)

        # Third run to be extra sure
        run_refresh_with_mock_data(*standard_period_data)
        assert_record_state(date(2025, 1, 1), expected_is_current=False)
        assert_record_state(date(2025, 7, 1), expected_is_current=True)

    def test_refresh_interest_rates_existing_latest_period_marked_current(
        self, create_existing_record, run_refresh_with_mock_data, assert_record_state
    ):
        # Create an existing record that should be the latest
        existing_latest_record = create_existing_record(date(2025, 7, 1), '0.067800', is_current=False)

        run_refresh_with_mock_data(
            ('4.56', '2025-01-01'), ('6.78', '2025-07-01')  # New period # Already exists, should be latest
        )

        assert ElicensingInterestRate.objects.count() == 2

        existing_latest_record.refresh_from_db()
        assert existing_latest_record.is_current_rate is True
        # The new earlier record should not be current
        assert_record_state(date(2025, 1, 1), expected_is_current=False)
