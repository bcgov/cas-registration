from reporting.models.reporting_year import ReportingYear
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.models.facility_report import FacilityReport
from registration.tests.utils.baker_recipes import operation, operator, facility
from model_bakery.recipe import Recipe, foreign_key


reporting_year = Recipe(ReportingYear)

report = Recipe(
    Report,
    operator=foreign_key(operator),
    operation=foreign_key(operation),
    reporting_year=foreign_key(reporting_year),
)

report_version = Recipe(ReportVersion, report=foreign_key(report))

facility_report = Recipe(FacilityReport, report_version=foreign_key(report_version), facility=foreign_key(facility))
