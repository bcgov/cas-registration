from model_bakery import baker

from registration.models import RegulatedProduct
from reporting.models import ReportNewEntrant, ReportNewEntrantProduction
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.facility_report import FacilityReport
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.report_activity import ReportActivity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.report_raw_activity_data import ReportRawActivityData
from reporting.tests.utils.bakers import report_version_baker, activity_baker, source_type_baker


def facility_report_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    default_props = {
        "facility": baker.make_recipe('registration.tests.utils.facility'),
        "report_version": report_version,
    }
    return baker.make(FacilityReport, **(default_props | props))


def report_activity_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    default_props = {
        "activity": activity_baker(),
        "activity_base_schema": ActivityJsonSchema.objects.first(),
        "report_version": report_version,
        "json_data": "{'test':'report_activity'}",
        "facility_report": facility_report_baker(report_version=report_version),
    }
    return baker.make(ReportActivity, **(default_props | props))


def report_source_type_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    default_props = {
        "activity_source_type_base_schema": ActivitySourceTypeJsonSchema.objects.first(),
        "source_type": source_type_baker(),
        "report_activity": report_activity_baker(report_version=report_version),
        "report_version": report_version,
        "json_data": "{'test':'report_source_type'}",
    }
    return baker.make(ReportSourceType, **(default_props | props))


def report_unit_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    report_source_type = props.get('report_source_type') or report_source_type_baker(report_version=report_version)

    default_props = {
        "report_source_type": report_source_type,
        "report_version": report_version,
        "json_data": "{'test':'report_unit'}",
    }
    return baker.make(ReportUnit, **(default_props | props))


def report_fuel_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    report_source_type = props.get('report_source_type') or report_source_type_baker(report_version=report_version)
    default_props = {
        "report_source_type": report_source_type,
        "report_unit": report_unit_baker(report_version=report_version),
        "fuel_type": FuelType.objects.first(),
        "report_version": report_version,
        "json_data": "{'test': 'report_fuel'}",
    }

    return baker.make(ReportFuel, **(default_props | props))


def report_emission_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    report_source_type = props.get('report_source_type') or report_source_type_baker(report_version=report_version)
    default_props = {
        "report_version": report_version,
        "json_data": "{'test': 'emission'}",
        "gas_type": GasType.objects.first(),
        "report_source_type": report_source_type,
        "report_fuel": report_fuel_baker(report_version=report_version, report_source_type=report_source_type),
    }

    return baker.make(ReportEmission, **(default_props | props))


def report_methodology_baker(**props):
    report_version = props.get('report_version') or report_version_baker()
    default_props = {
        "report_version": report_version,
        "json_data": "{'test': 'report_fuel'}",
        "report_emission": report_emission_baker(report_version=report_version),
    }

    return baker.make(ReportMethodology, **(default_props | props))


def report_raw_activity_data_baker(**props):
    """
    Baker function for creating ReportRawActivityData instances with default values.
    """
    facility_report = props.get('facility_report') or facility_report_baker()
    activity = props.get('activity') or activity_baker()

    default_props = {
        "facility_report": facility_report,
        "activity": activity,
        "json_data": '{"test": "raw_activity_data"}',
    }

    return baker.make(ReportRawActivityData, **(default_props | props))


def report_new_entrant_baker(**props) -> ReportNewEntrant:
    if "report_version" not in props:
        props["report_version"] = report_version_baker()

    report = baker.make(ReportNewEntrant, **props)

    return report


def report_new_entrant_production_baker(**props):
    report_new_entrant = props.get('report_new_entrant') or report_new_entrant_baker()
    product = props.get('product') or baker.make(RegulatedProduct)
    default_props = {
        "product": product,
        "report_new_entrant": report_new_entrant,
        "production_amount": 500,
    }
    return baker.make(ReportNewEntrantProduction, **(default_props | props))
