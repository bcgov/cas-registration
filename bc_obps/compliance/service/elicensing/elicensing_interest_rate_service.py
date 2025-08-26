import logging
from datetime import date, timedelta
from decimal import Decimal
from typing import List, Optional
from django.db import transaction
from compliance.models.elicensing_interest_rate import ElicensingInterestRate
from compliance.service.elicensing.elicensing_api_client import elicensing_api_client
from compliance.service.elicensing.schema import InterestRatePeriod

logger = logging.getLogger(__name__)


class ElicensingInterestRateService:
    """Service for fetching and updating eLicensing interest rates in the database."""

    CUTOFF_DATE = date(2025, 1, 1)
    FAR_FUTURE_DATE = date(2099, 12, 31)
    DEFAULT_END_DATE_OFFSET = timedelta(days=1)

    @classmethod
    def refresh_interest_rates(cls) -> None:
        """Fetches the latest interest rates from eLicensing and updates the database."""
        try:
            interest_rates = elicensing_api_client.get_interest_rates()
            logger.info(f"Fetched {len(interest_rates.periods)} interest rate periods from eLicensing")
            cls._update_database_with_rates(interest_rates.periods)
            logger.info("Interest rate refresh completed successfully")
        except Exception as exc:
            logger.error(f"Failed to refresh interest rates: {str(exc)}", exc_info=True)
            raise

    @classmethod
    def _is_period_after_cutoff(cls, period: InterestRatePeriod) -> bool:
        return date.fromisoformat(period.startDate) >= cls.CUTOFF_DATE

    @classmethod
    def _update_database_with_rates(cls, periods: List[InterestRatePeriod]) -> None:
        if not periods:
            logger.warning("No interest rate periods provided")
            return

        filtered_periods = [p for p in periods if cls._is_period_after_cutoff(p)]
        if not filtered_periods:
            logger.warning(f"No interest rate periods found after {cls.CUTOFF_DATE}")
            return

        sorted_periods = sorted(filtered_periods, key=lambda x: x.startDate)

        with transaction.atomic():
            ElicensingInterestRate.objects.update(is_current_rate=False)
            cls._process_and_store_periods(sorted_periods)

    @classmethod
    def _process_and_store_periods(cls, periods: List[InterestRatePeriod]) -> None:
        """Process and store interest rate periods in the database."""
        for index, period in enumerate(periods):
            start_date = date.fromisoformat(period.startDate)
            is_latest = index == len(periods) - 1

            if ElicensingInterestRate.objects.filter(start_date=start_date).exists():
                # If this is the latest period, ensure it's marked as current
                if is_latest:
                    ElicensingInterestRate.objects.filter(start_date=start_date).update(is_current_rate=True)
                continue

            end_date = cls._calculate_period_end_date(periods[index + 1] if index < len(periods) - 1 else None)
            # Convert to Decimal and divide by 100, then quantize to 6 decimal places
            decimal_rate = Decimal(str(period.rate)) / Decimal('100')
            quantized_rate = decimal_rate.quantize(Decimal('0.000001'))
            ElicensingInterestRate.objects.create(
                start_date=start_date,
                interest_rate=quantized_rate,
                end_date=end_date,
                is_current_rate=is_latest,
            )
            cls._update_previous_period_end_date(index, start_date, periods)

    @classmethod
    def _calculate_period_end_date(cls, next_period: Optional[InterestRatePeriod] = None) -> date:
        """Calculate the end date for a given period."""
        if next_period:
            return date.fromisoformat(next_period.startDate) - cls.DEFAULT_END_DATE_OFFSET
        return cls.FAR_FUTURE_DATE

    @classmethod
    def _update_previous_period_end_date(cls, index: int, start_date: date, periods: List[InterestRatePeriod]) -> None:
        """
        Updates the end date of the previous period's record.

        Args:
            index: Current period index (0-based).
            start_date: Start date of the current period.
            periods: Sorted list of all periods.
        """
        if index == 0:
            return

        previous_start_date = date.fromisoformat(periods[index - 1].startDate)
        new_end_date = start_date - cls.DEFAULT_END_DATE_OFFSET

        previous_record = ElicensingInterestRate.objects.get(start_date=previous_start_date)
        if previous_record.end_date != new_end_date:
            previous_record.end_date = new_end_date
            previous_record.save(update_fields=['end_date'])
            logger.info(f"Updated previous record end date from {previous_start_date} to {new_end_date}")
