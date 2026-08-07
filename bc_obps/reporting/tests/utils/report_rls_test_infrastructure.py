from model_bakery.baker import make_recipe
from registration.models.user_operator import UserOperator
from reporting.models.report_version import ReportVersion
from typing import Any

"""
    In order to test INSERT on dependent objects down the hierarchy, an existing chain from the parent object back to report_version is needed
"""


def generate_draft_parent_objects_for_insert(parent_object: str, report_version: ReportVersion):
    draft_parent_object = make_recipe(f'reporting.tests.utils.{parent_object}', report_version=report_version)
    return draft_parent_object


class ReportRlsTestSetup:
    """
    This class is used to create the report entities commonly used when testing RLS policies.
    """

    approved_user_operator: UserOperator
    report_version_2010_submitted: ReportVersion
    report_version_2010_draft: ReportVersion
    report_version_2013_draft: ReportVersion
    parent_object_2010_draft: Any
    parent_object_2013_draft: Any

    def __init__(self, parent_object: str):

        self.approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        operation = make_recipe('registration.tests.utils.operation', operator=self.approved_user_operator.operator)
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=self.approved_user_operator.operator,
            operation=operation,
            start_date='2009-01-01',
            end_date='2012-12-31',
        )
        reporting_year_2010 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2010)
        # Outside bounds of access
        reporting_year_2013 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2013)

        # 2010 - Within access bounds
        report_2010 = make_recipe(
            'reporting.tests.utils.report',
            operation=operation,
            operator=self.approved_user_operator.operator,
            reporting_year=reporting_year_2010,
        )
        self.report_version_2010_submitted = make_recipe(
            'reporting.tests.utils.report_version', report=report_2010, status='Submitted'
        )
        self.report_version_2010_draft = make_recipe(
            'reporting.tests.utils.report_version', report=report_2010, status='Draft'
        )
        self.parent_object_2010_draft = generate_draft_parent_objects_for_insert(
            parent_object, self.report_version_2010_draft
        )

        # 2013 report - Outside bounds of access
        report_2013 = make_recipe(
            'reporting.tests.utils.report',
            operation=operation,
            operator=self.approved_user_operator.operator,
            reporting_year=reporting_year_2013,
        )
        self.report_version_2013_draft = make_recipe(
            'reporting.tests.utils.report_version', report=report_2013, status='Draft'
        )
        self.parent_object_2013_draft = generate_draft_parent_objects_for_insert(
            parent_object, self.report_version_2013_draft
        )
