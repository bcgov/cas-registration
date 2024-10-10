from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.configuration import Configuration
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.methodology import Methodology
from reporting.models.report_activity import ReportActivity
from reporting.models.report_product import ReportProduct
from reporting.models.reporting_year import ReportingYear
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.models.facility_report import FacilityReport
from registration.tests.utils.baker_recipes import operation, operator, facility
from model_bakery.recipe import Recipe, foreign_key
from reporting.models.source_type import SourceType
from reporting.models.emission_category import EmissionCategory
from reporting.models.emission_category_mapping import EmissionCategoryMapping

reporting_year = Recipe(ReportingYear)

report = Recipe(
    Report,
    operator=foreign_key(operator),
    operation=foreign_key(operation),
    reporting_year=foreign_key(reporting_year),
)

report_version = Recipe(ReportVersion, report=foreign_key(report))

facility_report = Recipe(FacilityReport, report_version=foreign_key(report_version), facility=foreign_key(facility))

configuration = Recipe(Configuration)

activity = Recipe(Activity)
source_type = Recipe(SourceType)
fuel_type = Recipe(FuelType)
gas_type = Recipe(GasType)
methodology = Recipe(Methodology)

activity_json_schema = Recipe(
    ActivityJsonSchema,
    activity=foreign_key(activity),
    json_schema={"type": "object", "title": "Test Activity Json Schema", "properties": {}},
    valid_from=foreign_key(configuration),
    valid_to=foreign_key(configuration),
)
activity_source_type_json_schema = Recipe(
    ActivitySourceTypeJsonSchema,
    activity=foreign_key(activity),
    source_type=foreign_key(source_type),
    json_schema={"type": "object", "title": "Test Activity Source Type Json Schema", "properties": {}},
    valid_from=foreign_key(configuration),
    valid_to=foreign_key(configuration),
)

report_activity = Recipe(
    ReportActivity,
    facility_report=foreign_key(facility_report),
    activity_base_schema=foreign_key(activity_json_schema),
    activity=foreign_key(activity),
    report_version=foreign_key(report_version),
)

emission_category = Recipe(EmissionCategory)

emission_category_mapping = Recipe(
    EmissionCategoryMapping,
    activity=foreign_key(activity),
    source_type=foreign_key(source_type),
    emission_category=foreign_key(emission_category),
)
