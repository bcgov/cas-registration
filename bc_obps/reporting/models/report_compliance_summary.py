from django.db import models
from reporting.models import ReportVersion
from reporting.models.rls_configs.report_compliance_summary import Rls as ReportComplianceSummaryRls
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.triggers import immutable_report_version_trigger


class ReportComplianceSummary(TimeStampedModel):
    """Reporting Compliance Summary model"""

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_compliance_summary",
        db_comment="The version of the report this compliance summary data relates to",
    )
    emissions_attributable_for_reporting = models.DecimalField(
        db_comment="Total emissions in tCO2e that are considered attributable for reporting. This is the sum of all emissions reported from 'basic' emission categories",
        decimal_places=4,
        max_digits=20,
    )
    reporting_only_emissions = models.DecimalField(
        db_comment="Total emissions in tCO2e that are considered to be reporting-only emissions. This is the sum of emissions reported from 'excluded' categories and emissions from unregulated products",
        decimal_places=4,
        max_digits=20,
    )
    emissions_attributable_for_compliance = models.DecimalField(
        db_comment="Total emissions in tCO2e that are counted for compliance. This is the total difference between reporting emissions and reporting-only emissions",
        decimal_places=4,
        max_digits=20,
    )
    emissions_limit = models.DecimalField(
        db_comment="The emissions limit for the regulated operation. Calculation is in the Greenhouse Gas Emission Reporting Regulation (https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14)",
        decimal_places=4,
        max_digits=20,
    )
    excess_emissions = models.DecimalField(
        db_comment="The total amount of emissions that a regulated operation emmitted above the emissions limit. Definition in in the Greenhouse Gas Emission Reporting Regulation (https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14)",
        decimal_places=4,
        max_digits=20,
    )
    credited_emissions = models.DecimalField(
        db_comment="The total amount of emissions that a regulated operation emitted below the emissions limit. Definition in the Greenhouse Gas Emission Reporting Regulation (https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14)",
        decimal_places=4,
        max_digits=20,
    )
    reduction_factor = models.DecimalField(
        db_comment="The Province developed distinct reduction factors for products in the B.C. OBPS with disproportionately higher industrial process emissions than those produced in other sectors. https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf",
        decimal_places=4,
        max_digits=10,
    )
    tightening_rate = models.DecimalField(
        db_comment="Tightening rates are planned, yearly, gradual increases to BC OBPS stringency. https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf",
        decimal_places=4,
        max_digits=10,
    )
    initial_compliance_period = models.IntegerField(
        db_comment="The first compliance period (year) that the OBPS (Output Based Pricing System) program began",
        default=2024,
    )
    compliance_period = models.IntegerField(
        db_comment="The compliance period (year) that this compliance summary data was reported for"
    )

    class Meta:
        db_table_comment = "This table contains the compliance summary data calculated for a regulated operation."
        db_table = 'erc"."report_compliance_summary'
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportComplianceSummaryRls
