from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.electricity_import_data import Rls as ReportElectricityImportDataRls


class ReportElectricityImportData(TimeStampedModel):
    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_electricity_import_data",
        db_comment="The associated report version for this electricity import data",
    )
    import_specified_electricity = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Amount of imported electricity - specified sources",
    )
    import_specified_emissions = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Emissions from specified imports",
    )
    import_unspecified_electricity = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Amount of imported electricity - unspecified sources",
    )
    import_unspecified_emissions = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Emissions from unspecified imports",
    )
    export_specified_electricity = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Amount of exported electricity - specified sources",
    )
    export_specified_emissions = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Emissions from specified exports",
    )
    export_unspecified_electricity = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Amount of exported electricity - unspecified sources",
    )
    export_unspecified_emissions = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Emissions from unspecified exports",
    )
    canadian_entitlement_electricity = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Amount of electricity categorized as Canadian Entitlement Power",
    )
    canadian_entitlement_emissions = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=4,
        max_digits=20,
        db_comment="Emissions from Canadian Entitlement Power",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_electricity_import_data'
        app_label = "reporting"
        db_table_comment = "Table storing Electricity Import Data for the reporting system"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["report_version"],
                name="unique_electricity_import_data_per_report_version",
            )
        ]

    Rls = ReportElectricityImportDataRls
