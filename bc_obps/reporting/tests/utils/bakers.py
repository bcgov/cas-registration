from registration.tests.utils.bakers import operation_baker, operator_baker, facility_baker
from reporting.models import configuration_element
from reporting.models.gas_type import GasType
from registration.models import Activity
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.models.reporting_year import ReportingYear
from reporting.models.source_type import SourceType
from model_bakery import baker
from reporting.models.report import Report
from reporting.models.configuration_element import ConfigurationElement
from reporting.models.configuration import Configuration
from reporting.models.methodology import Methodology
from reporting.models.facility_report import FacilityReport


def report_baker(**props) -> Report:
    if "operator" not in props and "operator_id" not in props:
        props["operator"] = operator_baker()
    if "operation" not in props and "operation_id" not in props:
        props["operation"] = operation_baker(operator_id=(props["operator"].id if "operator" in props else None))
    return baker.make(Report, **props)


def report_version_baker(**props) -> ReportVersion:
    if "report" not in props and "report_id" not in props:
        props["report"] = report_baker()

    version = baker.make(ReportVersion, **props)

    if "report_operation" not in props:
        baker.make(ReportOperation, report_version=version)

    return version


def facility_report_baker(**props) -> FacilityReport:
    if "report_version" not in props and "report_version_id" not in props:
        props["report_version"] = report_version_baker()

    if "facility" not in props and "facility_id" not in props:
        props["facility"] = facility_baker()

    fr = baker.make(FacilityReport, **props)

    return fr


def activity_baker(custom_properties=None) -> Activity:
    properties = {}
    if custom_properties:
        properties.update(custom_properties)
    return baker.make(Activity, **properties)


def source_type_baker(custom_properties=None) -> SourceType:
    properties = {}
    if custom_properties:
        properties.update(custom_properties)
    return baker.make(SourceType, **properties)


def gas_type_baker() -> GasType:
    return baker.make(GasType)


def methodology_baker() -> Methodology:
    return baker.make(Methodology)


def configuration_element_baker() -> ConfigurationElement:
    return baker.make(ConfigurationElement)


def configuration_baker(custom_properties=None) -> configuration_element:
    properties = {}
    if custom_properties:
        properties.update(custom_properties)
    return baker.make(Configuration, **properties)


def reporting_year_baker(**props) -> ReportingYear:
    return baker.make(ReportingYear, **props)
