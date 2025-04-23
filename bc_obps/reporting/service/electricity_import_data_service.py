from typing import Optional

from reporting.models import ReportVersion, ReportAdditionalData, ElectricityImportData
from reporting.schema.electricity_import_data import ElectricityImportDataIn


class ElectricityImportDataService:
    @staticmethod
    def get_electricity_import_data(
        report_version_id: int,
    ) -> Optional[ReportAdditionalData]:
        return ReportAdditionalData.objects.filter(report_version__id=report_version_id).first()

    @staticmethod
    def save_electricity_import_data(version_id: int, data: ElectricityImportDataIn) -> ElectricityImportData:
        report_version = ReportVersion.objects.get(pk=version_id)
        electricity_import_data, _ = ElectricityImportData.objects.update_or_create(
            report_version=report_version, defaults=data.dict()
        )
        return electricity_import_data
