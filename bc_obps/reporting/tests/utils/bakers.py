from reporting.models import configuration_element
from reporting.models.base_schema import BaseSchema
from reporting.models.gas_type import GasType
from registration.models import ReportingActivity
from reporting.models.source_type import SourceType
from model_bakery import baker
from reporting.models.report import Report
from reporting.models.configuration_element import ConfigurationElement
from reporting.models.configuration import Configuration
from reporting.models.methodology import Methodology


def report_baker() -> Report:
    return baker.make(Report)

def reporting_activity_baker() -> ReportingActivity:
    return baker.make(ReportingActivity)

def source_type_baker() -> SourceType:
    return baker.make(SourceType)

def gas_type_baker() -> GasType:
    return baker.make(GasType)

def methodology_baker() -> Methodology:
    return baker.make(Methodology)

def base_schema_baker() -> BaseSchema:
    return baker.make(BaseSchema, slug='testSlug', schema="{'testkey': 'testValue'}")

def configuration_element_baker() -> ConfigurationElement:
    return baker.make(ConfigurationElement)

def configuration_baker() -> configuration_element:
    return baker.make(Configuration)
