from dataclasses import dataclass, asdict
from decimal import Decimal
from typing import Optional

from reporting.models import ReportVersion, ElectricityImportData


@dataclass
class ElectricityImportFormData:
    import_specified_electricity: Decimal | int
    import_specified_emissions: Decimal | int
    import_unspecified_electricity: Decimal | int
    import_unspecified_emissions: Decimal | int
    export_specified_electricity: Decimal | int
    export_specified_emissions: Decimal | int
    export_unspecified_electricity: Decimal | int
    export_unspecified_emissions: Decimal | int
    canadian_entitlement_electricity: Decimal | int
    canadian_entitlement_emissions: Decimal | int


class ElectricityImportDataService:
    @staticmethod
    def get_electricity_import_data(
        report_version_id: int,
    ) -> Optional[ElectricityImportData]:
        return ElectricityImportData.objects.filter(report_version__id=report_version_id).first()

    @staticmethod
    def save_electricity_import_data(version_id: int, payload: ElectricityImportFormData) -> ElectricityImportData:
        report_version = ReportVersion.objects.get(pk=version_id)
        payload_dict = asdict(payload)
        electricity_import_data, _ = ElectricityImportData.objects.update_or_create(
            report_version=report_version,
            defaults=payload_dict,
        )
        return electricity_import_data
