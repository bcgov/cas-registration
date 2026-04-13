from reporting.models.report_version import ReportVersion
from registration.models.operation import Operation


# Business rule: Jan–Mar partial-year production only applies for 2025
JAN_MAR_PRODUCTION_APPLICABLE_YEAR = 2025


class ReportOperationOptOutService:
    """
    Service responsible for determining operation opt-out status
    and related reporting rules.
    """

    @staticmethod
    def is_operation_opted_out(report_version: ReportVersion) -> bool:
        """
        Returns True if an operation is considered opted out.

        An operation is opted out only when:
        - its registration purpose is OPTED_IN_OPERATION
        - a final reporting year is set
        - the final reporting year is less than or equal to the current reporting year
        """

        report_operation = report_version.report_operation

        reporting_year = report_version.report.reporting_year.reporting_year

        registration_purpose = Operation.Purposes(report_operation.registration_purpose)

        opted_out_final_year = report_operation.operation_opted_out_final_reporting_year

        if registration_purpose != Operation.Purposes.OPTED_IN_OPERATION:
            return False

        if opted_out_final_year is None:
            return False

        return opted_out_final_year <= reporting_year

    @staticmethod
    def should_include_jan_mar_production(
        report_version: ReportVersion,
    ) -> bool:
        """
        Returns True if Jan–Mar production data should be included in schema.

        Jan–Mar production data is only applicable when:
        - the reporting year is JAN_MAR_PRODUCTION_APPLICABLE_YEAR
        - the operation is considered opted out
        """

        reporting_year = report_version.report.reporting_year.reporting_year

        return (
            reporting_year == JAN_MAR_PRODUCTION_APPLICABLE_YEAR
            and ReportOperationOptOutService.is_operation_opted_out(report_version)
        )
