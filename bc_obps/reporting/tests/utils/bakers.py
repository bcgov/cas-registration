from registration.tests.utils.bakers import operation_baker, operator_baker
from reporting.models import configuration_element, ReportPersonResponsible, ReportAdditionalData, ReportVerification
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


def report_baker(**props) -> Report:
    if "operator" not in props and "operator_id" not in props:
        props["operator"] = operator_baker()
    if "operation" not in props and "operation_id" not in props:
        props["operation"] = operation_baker(operator_id=(props["operator"].id if "operator" in props else None))
    return baker.make(Report, **props)


def report_version_baker(report_type="Annual Report", **props) -> ReportVersion:
    # Ensure that a report is created if not provided
    if "report" not in props and "report_id" not in props:
        props["report"] = report_baker()

    # Explicitly set report_type in props if not already provided
    props.setdefault("report_type", report_type)

    # Create the ReportVersion instance with given properties
    version = baker.make(ReportVersion, **props)

    # Ensure that ReportOperation is created and linked to ReportVersion
    if "report_operation" not in props:
        # You can set additional properties for ReportOperation here if needed
        baker.make(ReportOperation, report_version=version)

    return version


def report_person_responsible_baker(report_version=None) -> ReportPersonResponsible:
    if report_version is None:
        report_version = report_version_baker()

    return baker.make(
        ReportPersonResponsible,
        report_version=report_version,
        first_name="John",
        last_name="Doe",
        position_title="Manager",
        email="john.doe@example.com",
        phone_number="+16044011234",
        street_address="123 Elm St",
        municipality="Springfield",
        province="IL",
        postal_code="62701",
        business_role="Operation Representative",
    )


def report_additional_data_baker(report_version=None) -> ReportAdditionalData:
    if report_version is None:
        report_version = report_version_baker()
    return baker.make(
        ReportAdditionalData,
        report_version=report_version,
        capture_emissions=True,
        emissions_on_site_use=200,
        emissions_on_site_sequestration=200,
        emissions_off_site_transfer=200,
        electricity_generated=300,
    )


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
