from typing import ClassVar
from reporting.models.report_electricity_import_data import (
    ReportElectricityImportData,
)
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.validators.required_fields.base_required_fields_validator import (
    BaseRequiredFieldsValidator,
)
from reporting.service.report_validation.validators.required_fields.types import (
    RequiredFieldConfig,
)


class RequiredFieldsElectricityImportDataValidator(BaseRequiredFieldsValidator):
    SECTION: ClassVar[str] = "electricity_import_data"
    SECTION_TITLE: ClassVar[str] = "Electricity Import Data"

    REQUIRED_FIELDS: ClassVar[list[RequiredFieldConfig]] = [
        {
            "field": "import_specified_electricity",
            "label": "Amount of imported electricity - specified sources",
            "field_type": "scalar",
        },
        {
            "field": "import_specified_emissions",
            "label": "Emissions from specified imports",
            "field_type": "scalar",
        },
        {
            "field": "import_unspecified_electricity",
            "label": "Amount of imported electricity - unspecified sources",
            "field_type": "scalar",
        },
        {
            "field": "import_unspecified_emissions",
            "label": "Emissions from unspecified imports",
            "field_type": "scalar",
        },
        {
            "field": "export_specified_electricity",
            "label": "Amount of exported electricity - specified sources",
            "field_type": "scalar",
        },
        {
            "field": "export_specified_emissions",
            "label": "Emissions from specified exports",
            "field_type": "scalar",
        },
        {
            "field": "export_unspecified_electricity",
            "label": "Amount of exported electricity - unspecified sources",
            "field_type": "scalar",
        },
        {
            "field": "export_unspecified_emissions",
            "label": "Emissions from unspecified exports",
            "field_type": "scalar",
        },
        {
            "field": "canadian_entitlement_electricity",
            "label": "Amount of electricity categorized as Canadian Entitlement Power",
            "field_type": "scalar",
        },
        {
            "field": "canadian_entitlement_emissions",
            "label": "Emissions from Canadian Entitlement Power",
            "field_type": "scalar",
        },
    ]

    @classmethod
    def get_object_to_validate(
        cls,
        report_version: ReportVersion,
    ) -> ReportElectricityImportData:
        return report_version.report_electricity_import_data.get()
