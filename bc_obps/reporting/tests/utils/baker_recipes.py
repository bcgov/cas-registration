from datetime import date, timedelta, datetime
from typing import Any
from model_bakery import baker
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_person_responsible import ReportPersonResponsible
from reporting.models.report_product_emission_allocation import (
    ReportProductEmissionAllocation,
)

from registration.models import NaicsCode
from registration.models.activity import Activity
from reporting.models import (
    ReportNewEntrant,
    ReportNewEntrantEmission,
    ReportNewEntrantProduction,
    ReportOperationRepresentative,
    ReportElectricityImportData,
)
from reporting.models import ReportAdditionalData
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import (
    ActivitySourceTypeJsonSchema,
)
from reporting.models.configuration import Configuration
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.methodology import Methodology
from reporting.models.report_activity import ReportActivity
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct
from reporting.models.report_emission import ReportEmission
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_raw_activity_data import ReportRawActivityData
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.reporting_year import ReportingYear
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.models.facility_report import FacilityReport
from reporting.models.report_verification import ReportVerification
from reporting.models.report_verification_visit import ReportVerificationVisit
from reporting.models.report_change import ReportChange

from registration.tests.utils.baker_recipes import (
    operation,
    operator,
    facility,
    regulated_product,
)
from model_bakery.recipe import Recipe, foreign_key, seq
from reporting.models.source_type import SourceType
from reporting.models.emission_category import EmissionCategory
from reporting.models.emission_category_mapping import EmissionCategoryMapping
from reporting.models.report_non_attributable_emissions import (
    ReportNonAttributableEmissions,
)
from reporting.models import ReportComplianceSummary, ReportComplianceSummaryProduct
from reporting.models.report_sign_off import ReportSignOff
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation


def json_seq(
    json_key="generated_json",
    json_value="test json value",
    seq_value: Any = 1,
    **seq_args,
):
    """
    Extends model_bakery's `seq` function to generate sequential json values.
    seq_value is passed as the first argument to seq() and will initialize that sequence.
    """
    generator = seq(seq_value, **seq_args)
    while True:
        yield {json_key: f"{json_value} {next(generator)}"}


reporting_year = Recipe(ReportingYear)

report = Recipe(
    Report,
    operator=foreign_key(operator),
    operation=foreign_key(operation),
    reporting_year=foreign_key(reporting_year),
)

report_version = Recipe(ReportVersion, report=foreign_key(report))

facility_report = Recipe(
    FacilityReport,
    report_version=foreign_key(report_version),
    facility=foreign_key(facility, one_to_one=True),
)
report_operation = Recipe(ReportOperation, report_version=foreign_key(report_version))

report_verification = Recipe(ReportVerification, report_version=foreign_key(report_version))

electricity_import_data = Recipe(ReportElectricityImportData, report_version=foreign_key(report_version))
configuration = Recipe(
    Configuration,
    # We make one config per week
    valid_from=seq(date(4001, 1, 1), start=date(3001, 1, 1), increment_by=timedelta(days=8)),
    valid_to=seq(date(4001, 1, 7), start=date(3001, 1, 7), increment_by=timedelta(days=8)),
)

activity = Recipe(Activity)
source_type = Recipe(SourceType)
fuel_type = Recipe(FuelType)
gas_type = Recipe(GasType)
methodology = Recipe(Methodology)

activity_json_schema = Recipe(
    ActivityJsonSchema,
    activity=foreign_key(activity),
    json_schema={
        "type": "object",
        "title": "Test Activity Json Schema",
        "properties": {},
    },
    valid_from=foreign_key(configuration),
    valid_to=foreign_key(configuration),
)
activity_source_type_json_schema = Recipe(
    ActivitySourceTypeJsonSchema,
    activity=foreign_key(activity),
    source_type=foreign_key(source_type),
    json_schema={
        "type": "object",
        "title": "Test Activity Source Type Json Schema",
        "properties": {},
    },
    valid_from=foreign_key(configuration),
    valid_to=foreign_key(configuration),
)

report_activity = Recipe(
    ReportActivity,
    facility_report=foreign_key(facility_report),
    activity_base_schema=foreign_key(activity_json_schema),
    activity=foreign_key(activity),
    report_version=foreign_key(report_version),
    json_data=json_seq(json_value="generated report activity"),
)
report_source_type = Recipe(
    ReportSourceType,
    activity_source_type_base_schema=foreign_key(activity_source_type_json_schema),
    source_type=foreign_key(source_type),
    report_activity=foreign_key(report_activity),
    json_data=json_seq(json_value="generated report source type"),
    report_version=foreign_key(report_version),
)
report_unit = Recipe(
    ReportUnit,
    report_source_type=foreign_key(report_source_type),
    json_data=json_seq(json_value="generated report unit"),
    report_version=foreign_key(report_version),
)
report_fuel = Recipe(
    ReportFuel,
    fuel_type=foreign_key(fuel_type),
    report_unit=foreign_key(report_unit),
    report_source_type=foreign_key(report_source_type),
    json_data=json_seq(json_value="generated report fuel"),
    report_version=foreign_key(report_version),
)
report_emission = Recipe(
    ReportEmission,
    gas_type=foreign_key(gas_type),
    report_source_type=foreign_key(report_source_type),
    report_fuel=foreign_key(report_fuel),
    json_data=json_seq(json_value="generated report emission"),
    report_version=foreign_key(report_version),
)

emission_category = Recipe(EmissionCategory)

emission_category_mapping = Recipe(
    EmissionCategoryMapping,
    activity=foreign_key(activity),
    source_type=foreign_key(source_type),
    emission_category=foreign_key(emission_category),
)
report_product = Recipe(
    ReportProduct,
    facility_report=foreign_key(facility_report),
    report_version=foreign_key(report_version),
    product=foreign_key(regulated_product),
)

report_non_attributable_emissions = Recipe(
    ReportNonAttributableEmissions,
    report_version=foreign_key(report_version),
    facility_report=foreign_key(facility_report),
    activity="Test Activity",
    source_type="Test Source Type",
    emission_category=foreign_key(emission_category),
    gas_type=baker.prepare_recipe("reporting.tests.utils.gas_type", _quantity=2),
)

report_verification = Recipe(
    ReportVerification,
    report_version=foreign_key(report_version),
    verification_body_name="Default Verification Body",
    accredited_by=ReportVerification.AccreditedBy.ANAB,
    scope_of_verification=ReportVerification.ScopeOfVerification.BC_OBPS,
    threats_to_independence=False,
    verification_conclusion=ReportVerification.VerificationConclusion.POSITIVE,
)

report_verification_visit = Recipe(
    ReportVerificationVisit,
    report_verification=foreign_key(report_verification),
    visit_name="Default Visit Name",
    visit_type=ReportVerificationVisit.VisitType.IN_PERSON,
    visit_coordinates="",
    is_other_visit=False,
)

report_additional_data = Recipe(
    ReportAdditionalData,
    report_version=foreign_key(report_version),
    capture_emissions=True,
    emissions_on_site_use=100.0,
    emissions_on_site_sequestration=50.0,
    emissions_off_site_transfer=20.0,
    electricity_generated=500.0,
)

report_new_entrant = Recipe(
    ReportNewEntrant,
    report_version=foreign_key(report_version),
    authorization_date=(datetime.now() - timedelta(days=10)).isoformat(),
    first_shipment_date=(datetime.now() - timedelta(days=5)).isoformat(),
    new_entrant_period_start=(datetime.now() - timedelta(days=20)).isoformat(),
    assertion_statement=True,
)
report_new_entrant_emission = Recipe(
    ReportNewEntrantEmission,
    report_new_entrant=foreign_key(report_new_entrant),
    emission_category=foreign_key(emission_category),
    emission="5.0000",
)

report_new_entrant_production = Recipe(
    ReportNewEntrantProduction,
    report_new_entrant=foreign_key(report_new_entrant),
    product=foreign_key(regulated_product),
    production_amount="5.0000",
)

naics_code = Recipe(
    NaicsCode,
    naics_code="12345",
)

report_operation_representative = Recipe(
    ReportOperationRepresentative,
    report_version=foreign_key(report_version),
    representative_name="Test Report",
    selected_for_report=True,
)

report_emission_allocation = Recipe(
    ReportEmissionAllocation,
    report_version=foreign_key(report_version),
    facility_report=foreign_key(facility_report),
)

report_product_emission_allocation = Recipe(
    ReportProductEmissionAllocation,
    report_version=foreign_key(report_version),
    report_emission_allocation=foreign_key(report_emission_allocation),
    report_product=foreign_key(report_product),
    emission_category=foreign_key(emission_category),
)

report_attachment = Recipe(
    ReportAttachment,
    report_version=foreign_key(report_version),
    attachment="test",
)
report_methodology = Recipe(
    ReportMethodology,
    report_version=foreign_key(report_version),
    report_emission=foreign_key(report_emission),
    methodology=foreign_key(methodology),
    json_data=json_seq(json_value="generated report methodology"),
)

report_person_responsible = Recipe(
    ReportPersonResponsible,
    report_version=foreign_key(report_version),
)

report_raw_activity_data = Recipe(
    ReportRawActivityData,
    facility_report=foreign_key(facility_report),
    activity=foreign_key(activity),
    json_data=json_seq(json_value="generated raw activity data"),
)

report_sign_off = Recipe(
    ReportSignOff,
    report_version=foreign_key(report_version),
    acknowledgement_of_review=True,
    acknowledgement_of_records=True,
    acknowledgement_of_information=True,
    acknowledgement_of_possible_costs=True,
    signature="Test Signature",
    signing_date=datetime.now(),
)

report_compliance_summary = Recipe(ReportComplianceSummary, report_version=foreign_key(report_version))

report_compliance_summary_product = Recipe(
    ReportComplianceSummaryProduct,
    report_version=foreign_key(report_version),
    report_compliance_summary=foreign_key(report_compliance_summary),
    product=foreign_key(regulated_product),
)

report_attachment_confirmation = Recipe(
    ReportAttachmentConfirmation,
    report_version=foreign_key(report_version),
    confirm_supplementary_required_attachments_uploaded=True,
    confirm_supplementary_existing_attachments_relevant=True,
)

report_change = Recipe(
    ReportChange,
    report_version=foreign_key(report_version),
    reason_for_change="Reason explaining why this supplementary report change was made",
)
