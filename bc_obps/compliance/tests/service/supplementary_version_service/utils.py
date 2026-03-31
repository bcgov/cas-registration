from decimal import Decimal

import pytest
from model_bakery import baker
from registration.models import Operation
from reporting.models import ReportVersion

ZERO_DECIMAL = Decimal("0")


@pytest.mark.django_db
class BaseSupplementaryVersionServiceTest:
    def setup_method(self):
        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )
        self.report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        self.report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version',
            report=self.report,
            status=ReportVersion.ReportVersionStatus.Submitted,
        )
        self.report_version_2 = baker.make_recipe('reporting.tests.utils.report_version', report=self.report)
