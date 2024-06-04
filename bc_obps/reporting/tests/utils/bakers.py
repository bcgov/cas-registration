from reporting.models.gas_type import GasType
from registration.models import ReportingActivity
from reporting.models.source_type import SourceType
from model_bakery import baker
from reporting.models.report import Report
from reporting.models.configuration_element import ConfigurationElement


def report_baker() -> Report:
    return baker.make(Report)

def reporting_activity_baker() -> ReportingActivity:
    return baker.make(ReportingActivity)

def source_type_baker() -> SourceType:
    return baker.make(SourceType)

def gas_type_baker() -> GasType:
    return baker.make(GasType)

def configuration_element_baker() -> ConfigurationElement:
    return baker.make(ConfigurationElement)
