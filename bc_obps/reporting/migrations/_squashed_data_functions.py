from decimal import Decimal
import logging

import os
import json
from typing import Optional
from common.lib import pgtrigger


def update_activity_schema_titles(apps, schema_editor):

    import os
    import json

    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')

    cwd = os.getcwd()
    with open(
        f'{cwd}/reporting/json_schemas/2024/gsc_excluding_line_tracing/activity.json'
    ) as gsc_excluding_line_tracing:
        gsc_excluding_line_tracing_schema = json.load(gsc_excluding_line_tracing)

    ActivitySchema.objects.filter(activity_id=Activity.objects.get(slug='gsc_excluding_line_tracing').id).update(
        json_schema=gsc_excluding_line_tracing_schema
    )

    with open(
        f'{cwd}/reporting/json_schemas/2024/gsc_non_compression_non_combustion/activity.json'
    ) as gsc_non_compression_non_combustion:
        gsc_non_compression_non_combustion_schema = json.load(gsc_non_compression_non_combustion)

    ActivitySchema.objects.filter(activity_id=Activity.objects.get(slug='gsc_non_compression').id).update(
        json_schema=gsc_non_compression_non_combustion_schema
    )

    with open(
        f'{cwd}/reporting/json_schemas/2024/gsc_other_than_non_compression/activity.json'
    ) as gsc_other_than_non_compression:
        gsc_other_than_non_compression_schema = json.load(gsc_other_than_non_compression)

    ActivitySchema.objects.filter(activity_id=Activity.objects.get(slug='gsc_other_than_non_compression').id).update(
        json_schema=gsc_other_than_non_compression_schema
    )

    with open(
        f'{cwd}/reporting/json_schemas/2024/gsc_solely_for_line_tracing/activity.json'
    ) as gsc_solely_for_line_tracing:
        gsc_solely_for_line_tracing_schema = json.load(gsc_solely_for_line_tracing)

    ActivitySchema.objects.filter(activity_id=Activity.objects.get(slug='gsc_solely_for_line_tracing').id).update(
        json_schema=gsc_solely_for_line_tracing_schema
    )

    with open(
        f'{cwd}/reporting/json_schemas/2024/og_extraction_non_compression/activity.json'
    ) as og_extraction_non_compression:
        og_extraction_non_compression_schema = json.load(og_extraction_non_compression)

    ActivitySchema.objects.filter(activity_id=Activity.objects.get(slug='og_activities_non_compression').id).update(
        json_schema=og_extraction_non_compression_schema
    )

    with open(
        f'{cwd}/reporting/json_schemas/2024/og_extraction_other_than_ncnp/activity.json'
    ) as og_extraction_compression:
        og_extraction_compression_schema = json.load(og_extraction_compression)

    ActivitySchema.objects.filter(
        activity_id=Activity.objects.get(slug='og_activities_other_than_non_compression').id
    ).update(json_schema=og_extraction_compression_schema)

    with open(f'{cwd}/reporting/json_schemas/2024/ng_non_compression/activity.json') as ng_non_compression:
        ng_non_compression_schema = json.load(ng_non_compression)

    ActivitySchema.objects.filter(
        activity_id=Activity.objects.get(slug='natural_gas_activities_non_compression').id
    ).update(json_schema=ng_non_compression_schema)

    with open(
        f'{cwd}/reporting/json_schemas/2024/ng_other_than_non_compression/activity.json'
    ) as ng_other_than_non_compression:
        ng_other_than_non_compression_schema = json.load(ng_other_than_non_compression)

    ActivitySchema.objects.filter(
        activity_id=Activity.objects.get(slug='natural_gas_activities_other_than_non_compression').id
    ).update(json_schema=ng_other_than_non_compression_schema)


def create_2025_configuration(apps, schema_editor):
    """
    Create new Configuration for 2025 onwards and update existing 2024 configuration to end in 2024.
    This enables a configuration split for the new Pulp & Paper biogenic emissions requirements.
    """
    Configuration = apps.get_model('reporting', 'Configuration')

    # Update the existing 2024 configuration to end at 2025-12-31
    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01')
    config_2024.valid_to = '2024-12-31'
    config_2024.save()

    # Create new configuration for 2025 onwards
    Configuration.objects.create(slug='2025', valid_from='2025-01-01', valid_to='2099-12-31')


def reverse_create_2025_configuration(apps, schema_editor):
    """
    Reverse the configuration split by removing 2025 config and restoring 2024 config to 2099-12-31.
    """
    Configuration = apps.get_model('reporting', 'Configuration')

    # Delete the 2025 configuration
    Configuration.objects.filter(slug='2025').delete()

    # Restore the 2024 configuration to end at 2099-12-31
    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01')
    config_2024.valid_to = '2099-12-31'
    config_2024.save()


def update_configuration_elements(apps, schema_editor):
    """
    Update all existing ConfigurationElement records to span both 2024 and 2025 configurations.
    This allows configuration elements to remain valid across both years unless explicitly changed.
    """
    Configuration = apps.get_model('reporting', 'Configuration')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')

    # Get the configurations
    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01', valid_to='2024-12-31')
    config_2025 = Configuration.objects.get(slug='2025', valid_from='2025-01-01', valid_to='2099-12-31')

    # Update all ConfigurationElements that point to 2024 config to instead point to 2025 config
    ConfigurationElement.objects.filter(valid_to_id=config_2024.id).update(valid_to_id=config_2025.id)


def reverse_update_configuration_elements(apps, schema_editor):
    """
    Reverse the update by restoring ConfigurationElement records to point to the 2024 configuration.
    """
    Configuration = apps.get_model('reporting', 'Configuration')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')

    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01', valid_to='2024-12-31')

    # Restore all ConfigurationElements to point to the 2024 config
    ConfigurationElement.objects.filter(valid_to_id__isnull=False).update(valid_to_id=config_2024.id)


def update_activity_schemas(apps, schema_editor):
    """
    Update all existing ActivityJsonSchema and ActivitySourceTypeJsonSchema records
    to span both 2024 and 2025 configurations.
    This allows schemas to remain valid across both years unless explicitly changed (e.g., Pulp & Paper).
    """
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivityJsonSchema = apps.get_model('reporting', 'ActivityJsonSchema')
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')

    # Get the configurations
    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01', valid_to='2024-12-31')
    config_2025 = Configuration.objects.get(slug='2025', valid_from='2025-01-01', valid_to='2099-12-31')

    # Update all ActivityJsonSchema records that point to 2024 config to instead point to 2025 config
    ActivityJsonSchema.objects.filter(valid_to_id=config_2024.id).update(valid_to_id=config_2025.id)

    # Update all ActivitySourceTypeJsonSchema records that point to 2024 config to instead point to 2025 config
    ActivitySourceTypeJsonSchema.objects.filter(valid_to_id=config_2024.id).update(valid_to_id=config_2025.id)


def reverse_update_activity_schemas(apps, schema_editor):
    """
    Reverse the update by restoring schema records to point to the 2024 configuration.
    """
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivityJsonSchema = apps.get_model('reporting', 'ActivityJsonSchema')
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')

    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01', valid_to='2024-12-31')

    # Restore all ActivityJsonSchema records to point to the 2024 config
    ActivityJsonSchema.objects.filter(valid_to_id__isnull=False).update(valid_to_id=config_2024.id)

    # Restore all ActivitySourceTypeJsonSchema records to point to the 2024 config
    ActivitySourceTypeJsonSchema.objects.filter(valid_to_id__isnull=False).update(valid_to_id=config_2024.id)


def init_pulp_and_paper_2025_schemas(apps, schema_editor):
    """
    Handle Pulp & Paper schema changes for 2025:
    1. End the existing Pulp & Paper schemas at the 2024 configuration
    2. Create new ActivityJsonSchema and ActivitySourceTypeJsonSchema for 2025 with biogenic emissions split fields
    """
    import os

    ActivityJsonSchema = apps.get_model('reporting', 'ActivityJsonSchema')
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')

    # Get the configurations
    config_2024 = Configuration.objects.get(slug='2024', valid_from='2023-01-01', valid_to='2024-12-31')
    config_2025 = Configuration.objects.get(slug='2025', valid_from='2025-01-01', valid_to='2099-12-31')

    # Get activity and source type
    pulp_paper_activity = Activity.objects.get(name='Pulp and paper production')
    pulping_source_type = SourceType.objects.get(name='Pulping and chemical recovery')

    # Update existing Pulp & Paper schemas to end at 2024 config
    ActivityJsonSchema.objects.filter(activity=pulp_paper_activity).update(valid_to_id=config_2024.id)
    ActivitySourceTypeJsonSchema.objects.filter(activity=pulp_paper_activity).update(valid_to_id=config_2024.id)

    # Load the new JSON schemas for 2025
    cwd = os.getcwd()

    with open(f'{cwd}/reporting/json_schemas/2025/pulp_and_paper_production/activity.json') as f:
        activity_schema = json.load(f)

    with open(f'{cwd}/reporting/json_schemas/2025/pulp_and_paper_production/pulp_and_paper_production.json') as f:
        source_type_schema = json.load(f)

    # Create new ActivityJsonSchema for 2025
    ActivityJsonSchema.objects.create(
        activity=pulp_paper_activity,
        json_schema=activity_schema,
        valid_from=config_2025,
        valid_to=config_2025,
    )

    # Create new ActivitySourceTypeJsonSchema for 2025
    ActivitySourceTypeJsonSchema.objects.create(
        activity=pulp_paper_activity,
        source_type=pulping_source_type,
        has_unit=False,
        has_fuel=False,
        json_schema=source_type_schema,
        valid_from=config_2025,
        valid_to=config_2025,
    )


def reverse_init_pulp_and_paper_2025_schemas(apps, schema_editor):
    ActivityJsonSchema = apps.get_model('reporting', 'ActivityJsonSchema')
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')

    config_2025 = Configuration.objects.get(slug='2025', valid_from='2025-01-01', valid_to='2099-12-31')

    pulp_paper_activity = Activity.objects.get(name='Pulp and paper production')

    # Delete the 2025 schemas
    ActivityJsonSchema.objects.filter(
        activity=pulp_paper_activity,
        valid_from=config_2025,
    ).delete()

    ActivitySourceTypeJsonSchema.objects.filter(
        activity=pulp_paper_activity,
        valid_from=config_2025,
    ).delete()

    ActivityJsonSchema.objects.filter(activity=pulp_paper_activity).update(valid_to_id=config_2025.id)
    ActivitySourceTypeJsonSchema.objects.filter(activity=pulp_paper_activity).update(valid_to_id=config_2025.id)


def insert_lime_recovery_kiln_override(apps, schema_monitor):
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    NaicsRegulatoryOverride = apps.get_model('reporting', 'NaicsRegulatoryOverride')

    lime_recovery_kiln_naics = NaicsCode.objects.get(naics_code='322112')
    lime_recovery_kiln_product = RegulatedProduct.objects.get(name='Pulp and paper: lime recovered by kiln')

    NaicsRegulatoryOverride.objects.create(
        naics_code=lime_recovery_kiln_naics,
        regulated_product=lime_recovery_kiln_product,
        reduction_factor=Decimal('0.9'),
        tightening_rate=Decimal('0.01'),
        valid_from='2025-01-01',
        valid_to='9999-12-31',
    )


def revert_lime_recovery_kiln_override(apps, schema_monitor):
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    NaicsRegulatoryOverride = apps.get_model('reporting', 'NaicsRegulatoryOverride')

    lime_recovery_kiln_naics = NaicsCode.objects.get(naics_code='322112')
    lime_recovery_kiln_product = RegulatedProduct.objects.get(name='Pulp and paper: lime recovered by kiln')

    NaicsRegulatoryOverride.objects.filter(
        naics_code=lime_recovery_kiln_naics,
        regulated_product=lime_recovery_kiln_product,
        valid_from='2025-01-01',
        valid_to='9999-12-31',
    ).delete()


def fix_municipal_solid_waste_fuel_name(apps, schema_editor):
    FuelType = apps.get_model("reporting", "FuelType")
    FuelType.objects.filter(name="Municipal Solide Waste - biomass component").update(
        name="Municipal Solid Waste - biomass component"
    )


# There are currently duplicate records in the Methodology table:
# Default EF = Default emission factor
# Measured EF = Measured emission factor
# The fully spelled out records were created in error, but have currently never been used in reporting data.
# These records should be removed, with a check that they have not been used in reporting data.
def remove_duplicate_methodology_records(apps, schema_editor):

    logger = logging.getLogger(__name__)

    Methodology = apps.get_model('reporting', 'Methodology')
    ReportMethodology = apps.get_model('reporting', 'ReportMethodology')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    duplicate_default_ef = Methodology.objects.get(name='Default emission factor')
    duplicate_measured_ef = Methodology.objects.get(name='Measured emission factor')
    original_default_ef = Methodology.objects.get(name='Default EF')
    original_measured_ef = Methodology.objects.get(name='Measured EF')

    # Remove duplicate records if they have still not been reported at time of migration
    if ReportMethodology.objects.filter(methodology_id=duplicate_default_ef.id).count() == 0:
        ConfigurationElement.objects.filter(methodology_id=duplicate_default_ef.id).update(
            methodology_id=original_default_ef
        )
        duplicate_default_ef.delete()
    else:
        logger.info(
            'Cannot delete duplicate default emission factor methodology records. It has been reported in the ReportMethodology data.'
        )
    if ReportMethodology.objects.filter(methodology_id=duplicate_measured_ef.id).count() == 0:
        ConfigurationElement.objects.filter(methodology_id=duplicate_measured_ef.id).update(
            methodology_id=original_measured_ef
        )
        duplicate_measured_ef.delete()
    else:
        logger.info(
            'Cannot delete duplicate measured emission factor methodology records. It has been reported in the ReportMethodology data.'
        )


# Helper function to turn a string into a camel-cased json key
def str_to_camel_case(st: str) -> str:
    output = "".join(x for x in st.title() if x.isalnum())
    return output[0].lower() + output[1:]


def populate_slug(apps, schema_monitor):
    ReportingField = apps.get_model('reporting', 'ReportingField')
    for reporting_field in ReportingField.objects.all():
        slug_to_insert = str_to_camel_case(reporting_field.field_name)
        reporting_field.slug = slug_to_insert
        reporting_field.save()


def insert_validation_records(apps, schema_monitor):
    ExpectedValueRangeFuelAmount = apps.get_model('reporting', 'ExpectedValueRangeFuelAmount')
    ExpectedValueRangeMethodologyField = apps.get_model('reporting', 'ExpectedValueRangeMethodologyField')
    FuelType = apps.get_model('reporting', 'FuelType')
    Methodology = apps.get_model('reporting', 'Methodology')
    ReportingField = apps.get_model('reporting', 'ReportingField')

    # Methodologies
    measured_hhv = Methodology.objects.get(name='Measured HHV/Default EF')  # Measured High Heating Value
    default_hhv = Methodology.objects.get(name='Default HHV/Default EF')  # Default High Heating Value
    measured_cc = Methodology.objects.get(name='Measured CC')  # CC Weight fraction
    default_ef = Methodology.objects.get(name='Default EF')  # Default EF
    measured_ef = Methodology.objects.get(name='Measured EF')  # Measured EF
    measured_steam_default_ef = Methodology.objects.get(name='Measured Steam/Default EF')  # Measured Steam Default EF
    measured_steam_measured_ef = Methodology.objects.get(
        name='Measured Steam/Measured EF'
    )  # Measured Steam Measured EF
    heat_input_default_ef = Methodology.objects.get(name='Heat Input/Default EF')  # Heat Input Default EF

    # Reporting Fields
    measured_high_heating_value_field = ReportingField.objects.get(slug='fuelAnnualWeightedAverageHighHeatingValue')
    default_high_heating_value_field = ReportingField.objects.get(slug='fuelDefaultHighHeatingValue')
    cc_weight_fraction_field = ReportingField.objects.get(slug='fuelAnnualWeightedAverageCarbonContentWeightFraction')
    annual_steam_generated_field = ReportingField.objects.get(slug='unitFuelAnnualSteamGenerated')
    boiler_ratio_field = ReportingField.objects.get(slug='boilerRatio')

    ## CO2 Fields
    co2_measured_hhv_default_ef_field = ReportingField.objects.get(slug='unitFuelCo2MeasuredHhvDefaultEf')
    co2_default_hhv_default_ef_field = ReportingField.objects.get(slug='unitFuelCo2DefaultHhvDefaultEf')
    co2_default_ef_field = ReportingField.objects.get(slug='unitFuelCo2DefaultEf')
    co2_measured_steam_default_ef_field = ReportingField.objects.get(slug='unitFuelCo2MeasuredSteamDefaultEf')
    co2_measured_steam_measured_ef_field = ReportingField.objects.get(slug='unitFuelCo2MeasuredSteamMeasuredEf')

    ## CH4 Fields
    ch4_measured_hhv_default_ef_field = ReportingField.objects.get(slug='unitFuelCh4MeasuredHhvDefaultEf')
    ch4_default_hhv_default_ef_field = ReportingField.objects.get(slug='unitFuelCh4DefaultHhvDefaultEf')
    ch4_default_ef_field = ReportingField.objects.get(slug='unitFuelCh4DefaultEf')
    ch4_measured_ef_field = ReportingField.objects.get(slug='unitFuelCh4MeasuredEf')
    ch4_measured_steam_default_ef_field = ReportingField.objects.get(slug='unitFuelCh4MeasuredSteamDefaultEf')
    ch4_heat_input_default_ef_field = ReportingField.objects.get(slug='unitFuelCh4HeatInputDefaultEf')

    ## N2O Fields
    n2o_measured_hhv_default_ef_field = ReportingField.objects.get(slug='unitFuelN2OMeasuredHhvDefaultEf')
    n2o_default_hhv_default_ef_field = ReportingField.objects.get(slug='unitFuelN2ODefaultHhvDefaultEf')
    n2o_default_ef_field = ReportingField.objects.get(slug='unitFuelN2ODefaultEf')
    n2o_measured_ef_field = ReportingField.objects.get(slug='unitFuelN2OMeasuredEf')
    n2o_measured_steam_default_ef_field = ReportingField.objects.get(slug='unitFuelN2OMeasuredSteamDefaultEf')
    n2o_heat_input_default_ef_field = ReportingField.objects.get(slug='unitFuelN2OHeatInputDefaultEf')

    ####################
    #   NATURAL GAS    #
    ####################

    # Natural Gas fuel_amount bounds
    natural_gas = FuelType.objects.get(name='Natural Gas')
    ExpectedValueRangeFuelAmount.objects.create(
        fuel_type=natural_gas,
        lower_bound=Decimal('0'),
        upper_bound=Decimal('5000000.00'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    # Natural Gas Methodology bounds
    ### Measured High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=measured_hhv,
        reporting_field=measured_high_heating_value_field,
        lower_bound=Decimal('0.02'),
        upper_bound=Decimal('0.06'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Default High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=default_hhv,
        reporting_field=default_high_heating_value_field,
        lower_bound=Decimal('0.02'),
        upper_bound=Decimal('0.06'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CC Weight Fraction
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=measured_cc,
        reporting_field=cc_weight_fraction_field,
        lower_bound=Decimal('0.3'),
        upper_bound=Decimal('1.5'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=measured_hhv,
        reporting_field=ch4_measured_hhv_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('2.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=default_hhv,
        reporting_field=ch4_default_hhv_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('2.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=measured_hhv,
        reporting_field=n2o_measured_hhv_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('3.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=default_hhv,
        reporting_field=n2o_default_hhv_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('3.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=default_ef,
        reporting_field=ch4_default_ef_field,
        lower_bound=Decimal('0.02'),
        upper_bound=Decimal('0.1'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=natural_gas,
        methodology=default_ef,
        reporting_field=n2o_default_ef_field,
        lower_bound=Decimal('0.02'),
        upper_bound=Decimal('0.1'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )

    ####################
    #      DIESEL      #
    ####################

    # Diesel fuel_amount bounds
    diesel = FuelType.objects.get(name='Diesel')
    ExpectedValueRangeFuelAmount.objects.create(
        fuel_type=diesel,
        lower_bound=Decimal('0'),
        upper_bound=Decimal('5000.00'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )

    # Diesel Methodology bounds
    ### Measured High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_hhv,
        reporting_field=measured_high_heating_value_field,
        lower_bound=Decimal('20.0'),
        upper_bound=Decimal('80.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Default High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_hhv,
        reporting_field=default_high_heating_value_field,
        lower_bound=Decimal('20.0'),
        upper_bound=Decimal('80.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CC Weight Fraction
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_cc,
        reporting_field=cc_weight_fraction_field,
        lower_bound=Decimal('300.0'),
        upper_bound=Decimal('1500.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CO2 kg CO2/kl
    ### CO2 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_hhv,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('1000.0'),
        upper_bound=Decimal('5000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_hhv,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('1000.0'),
        upper_bound=Decimal('5000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_ef,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('1000.0'),
        upper_bound=Decimal('5000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_steam_default_ef,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('1000.0'),
        upper_bound=Decimal('5000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Measured Steam Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_steam_measured_ef,
        reporting_field=co2_measured_steam_measured_ef_field,
        lower_bound=Decimal('1000.0'),
        upper_bound=Decimal('5000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CH4 g CH4/kl
    ### CH4 Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_ef,
        reporting_field=ch4_default_ef_field,
        lower_bound=Decimal('60.0'),
        upper_bound=Decimal('200.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_ef,
        reporting_field=ch4_measured_ef_field,
        lower_bound=Decimal('60.0'),
        upper_bound=Decimal('200.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## N2O g N2O/kl
    ### N2O Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_ef,
        reporting_field=n2o_default_ef_field,
        lower_bound=Decimal('200.0'),
        upper_bound=Decimal('800.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_ef,
        reporting_field=n2o_measured_ef_field,
        lower_bound=Decimal('200.0'),
        upper_bound=Decimal('800.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CO2 kg CO2/GJ
    ### CO2 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_hhv,
        reporting_field=co2_measured_hhv_default_ef_field,
        lower_bound=Decimal('30.0'),
        upper_bound=Decimal('150.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_hhv,
        reporting_field=co2_default_hhv_default_ef_field,
        lower_bound=Decimal('30.0'),
        upper_bound=Decimal('150.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_steam_default_ef,
        reporting_field=co2_measured_steam_default_ef_field,
        lower_bound=Decimal('30.0'),
        upper_bound=Decimal('150.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CH4 g CH4/GJ
    ### CH4 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_hhv,
        reporting_field=ch4_measured_hhv_default_ef_field,
        lower_bound=Decimal('1.5'),
        upper_bound=Decimal('7.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_hhv,
        reporting_field=ch4_default_hhv_default_ef_field,
        lower_bound=Decimal('1.5'),
        upper_bound=Decimal('7.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_steam_default_ef,
        reporting_field=ch4_measured_steam_default_ef_field,
        lower_bound=Decimal('1.5'),
        upper_bound=Decimal('7.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Heat Input Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=heat_input_default_ef,
        reporting_field=ch4_heat_input_default_ef_field,
        lower_bound=Decimal('1.5'),
        upper_bound=Decimal('7.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## N2O g N2O/GJ
    ### N2O Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_hhv,
        reporting_field=n2o_measured_hhv_default_ef_field,
        lower_bound=Decimal('5.0'),
        upper_bound=Decimal('20.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=default_hhv,
        reporting_field=n2o_default_hhv_default_ef_field,
        lower_bound=Decimal('5.0'),
        upper_bound=Decimal('20.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=measured_steam_default_ef,
        reporting_field=n2o_measured_steam_default_ef_field,
        lower_bound=Decimal('5.0'),
        upper_bound=Decimal('20.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Heat Input Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=diesel,
        methodology=heat_input_default_ef,
        reporting_field=n2o_heat_input_default_ef_field,
        lower_bound=Decimal('5.0'),
        upper_bound=Decimal('20.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )

    ####################
    #     PROPANE      #
    ####################

    # Propane fuel_amount bounds
    propane = FuelType.objects.get(name='Propane')
    ExpectedValueRangeFuelAmount.objects.create(
        fuel_type=propane,
        lower_bound=Decimal('0'),
        upper_bound=Decimal('1000.00'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )

    # Propane Methodology bounds
    ### Measured High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_hhv,
        reporting_field=measured_high_heating_value_field,
        lower_bound=Decimal('10.0'),
        upper_bound=Decimal('50.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Default High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_hhv,
        reporting_field=default_high_heating_value_field,
        lower_bound=Decimal('10.0'),
        upper_bound=Decimal('50.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CC Weight Fraction
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_cc,
        reporting_field=cc_weight_fraction_field,
        lower_bound=Decimal('200.0'),
        upper_bound=Decimal('800.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CO2 kg CO2/kl
    ### CO2 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_hhv,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('700.0'),
        upper_bound=Decimal('3000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_hhv,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('700.0'),
        upper_bound=Decimal('3000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_ef,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('700.0'),
        upper_bound=Decimal('3000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_steam_default_ef,
        reporting_field=co2_default_ef_field,
        lower_bound=Decimal('700.0'),
        upper_bound=Decimal('3000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Measured Steam Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_steam_measured_ef,
        reporting_field=co2_measured_steam_measured_ef_field,
        lower_bound=Decimal('700.0'),
        upper_bound=Decimal('3000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CH4 g CH4/kl
    ### CH4 Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_ef,
        reporting_field=ch4_default_ef_field,
        lower_bound=Decimal('10.0'),
        upper_bound=Decimal('50.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_ef,
        reporting_field=ch4_measured_ef_field,
        lower_bound=Decimal('10.0'),
        upper_bound=Decimal('50.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## N2O kg N2O/kl
    ### N2O Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_ef,
        reporting_field=n2o_default_ef_field,
        lower_bound=Decimal('50.0'),
        upper_bound=Decimal('200.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_ef,
        reporting_field=n2o_measured_ef_field,
        lower_bound=Decimal('50.0'),
        upper_bound=Decimal('200.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CO2 kg CO2/GJ
    ### CO2 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_hhv,
        reporting_field=co2_measured_hhv_default_ef_field,
        lower_bound=Decimal('30.0'),
        upper_bound=Decimal('120.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_hhv,
        reporting_field=co2_default_hhv_default_ef_field,
        lower_bound=Decimal('30.0'),
        upper_bound=Decimal('120.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CO2 Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_steam_default_ef,
        reporting_field=co2_measured_steam_default_ef_field,
        lower_bound=Decimal('30.0'),
        upper_bound=Decimal('120.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## CH4 g CH4/GJ
    ### CH4 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_hhv,
        reporting_field=ch4_measured_hhv_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('2.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_hhv,
        reporting_field=ch4_default_hhv_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('2.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_steam_default_ef,
        reporting_field=ch4_measured_steam_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('2.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Heat Input Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=heat_input_default_ef,
        reporting_field=ch4_heat_input_default_ef_field,
        lower_bound=Decimal('0.5'),
        upper_bound=Decimal('2.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ## N2O g N2O/GJ
    ### N2O Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_hhv,
        reporting_field=n2o_measured_hhv_default_ef_field,
        lower_bound=Decimal('2.0'),
        upper_bound=Decimal('10.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=default_hhv,
        reporting_field=n2o_default_hhv_default_ef_field,
        lower_bound=Decimal('2.0'),
        upper_bound=Decimal('10.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Measured Steam Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=measured_steam_default_ef,
        reporting_field=n2o_measured_steam_default_ef_field,
        lower_bound=Decimal('2.0'),
        upper_bound=Decimal('10.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Heat Input Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=propane,
        methodology=heat_input_default_ef,
        reporting_field=n2o_heat_input_default_ef_field,
        lower_bound=Decimal('2.0'),
        upper_bound=Decimal('10.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )

    ####################
    #     Field Gas    #
    ####################

    # Field Gas fuel_amount bounds
    field_gas = FuelType.objects.get(name='Field gas')
    ExpectedValueRangeFuelAmount.objects.create(
        fuel_type=field_gas,
        lower_bound=Decimal('0'),
        upper_bound=Decimal('5000000.00'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    # Field Gas Methodology bounds
    ### Measured High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=measured_hhv,
        reporting_field=measured_high_heating_value_field,
        lower_bound=Decimal('0.02'),
        upper_bound=Decimal('0.06'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Default High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=default_hhv,
        reporting_field=default_high_heating_value_field,
        lower_bound=Decimal('0.02'),
        upper_bound=Decimal('0.06'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CC Weight Fraction
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=measured_cc,
        reporting_field=cc_weight_fraction_field,
        lower_bound=Decimal('0.3'),
        upper_bound=Decimal('1.5'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=measured_hhv,
        reporting_field=ch4_measured_hhv_default_ef_field,
        lower_bound=Decimal('80.0'),
        upper_bound=Decimal('300.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### CH4 Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=default_hhv,
        reporting_field=ch4_default_hhv_default_ef_field,
        lower_bound=Decimal('80.0'),
        upper_bound=Decimal('300.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Measured HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=measured_hhv,
        reporting_field=n2o_measured_hhv_default_ef_field,
        lower_bound=Decimal('0.4'),
        upper_bound=Decimal('3.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### N2O Default HHV Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=field_gas,
        methodology=default_hhv,
        reporting_field=n2o_default_hhv_default_ef_field,
        lower_bound=Decimal('0.4'),
        upper_bound=Decimal('3.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )

    ####################
    #    Wood Waste    #
    ####################

    # Wood Waste fuel_amount bounds
    wood_waste = FuelType.objects.get(name='Wood Waste')
    ExpectedValueRangeFuelAmount.objects.create(
        fuel_type=wood_waste,
        lower_bound=Decimal('0'),
        upper_bound=Decimal('1000000.00'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    # Wood Waste Methodology bounds
    ### Measured High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=wood_waste,
        methodology=measured_hhv,
        reporting_field=measured_high_heating_value_field,
        lower_bound=Decimal('10.0'),
        upper_bound=Decimal('40.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Default High Heating Value
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=wood_waste,
        methodology=default_hhv,
        reporting_field=default_high_heating_value_field,
        lower_bound=Decimal('10.0'),
        upper_bound=Decimal('40.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Annual Steam Generated Measured EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=wood_waste,
        methodology=measured_steam_measured_ef,
        reporting_field=annual_steam_generated_field,
        lower_bound=Decimal('0.0'),
        upper_bound=Decimal('6000000.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )
    ### Annual Steam Generated Default EF
    ExpectedValueRangeMethodologyField.objects.create(
        fuel_type=wood_waste,
        methodology=measured_steam_default_ef,
        reporting_field=boiler_ratio_field,
        lower_bound=Decimal('3.0'),
        upper_bound=Decimal('6.0'),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )


def revert_validation_records(apps, schema_monitor):
    ExpectedValueRangeFuelAmount = apps.get_model('reporting', 'ExpectedValueRangeFuelAmount')
    ExpectedValueRangeMethodologyField = apps.get_model('reporting', 'ExpectedValueRangeMethodologyField')

    ExpectedValueRangeMethodologyField.objects.all().delete()
    ExpectedValueRangeFuelAmount.objects.all().delete()


def seed_fuel_type_descriptions(apps, schema_editor):
    FuelType = apps.get_model("reporting", "FuelType")
    FuelType.objects.filter(name="Natural Gas").update(
        description='Natural Gas refers to purchased or marketable natural gas. For non-marketable natural gas or producer consumption, please use "Field gas".'
    )
    FuelType.objects.filter(name="Field gas").update(
        description='Field gas refers to non-marketable natural gas and producer consumption. For marketable natural gas, please use "Natural Gas".'
    )


def update_chemical_pulp_pwaei_for_2025(apps, schema_editor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    ProductEmissionIntensity = apps.get_model('reporting', 'ProductEmissionIntensity')

    chemical_pulp_product = RegulatedProduct.objects.get(name='Pulp and paper: chemical pulp')

    # update valid_to date on the old PWAEI to be end of reporting year 2024
    ProductEmissionIntensity.objects.filter(product_id=chemical_pulp_product.id).update(valid_to="2024-12-31")
    # create new ProductEmissionIntensity for new value of PWAEI, valid from start of reporting year 2025
    ProductEmissionIntensity.objects.create(
        product_id=chemical_pulp_product.id,
        product_weighted_average_emission_intensity=0.3095,
        valid_from="2025-01-01",
        valid_to="9999-12-31",
    )


def update_activity_slug_name(apps, schema_editor, slug_name: str, updated_slug: str) -> Optional[object]:
    """
    Update an existing Activity record based on the slug_name.
    This is used in this migration to revert changes made to slug names in migration 0150.

    Args:
        slug_name: The slug of the Activity to update.
        updated_slug: The new slug for the Activity.

    Returns:
        The updated Activity instance if found, otherwise None.
    """
    Activity = apps.get_model('registration', 'Activity')

    try:
        activity = Activity.objects.get(slug=slug_name)
    except Activity.DoesNotExist:
        return None
    with pgtrigger.ignore("registration.Activity:immutable_slug"):
        activity.slug = updated_slug
        activity.save()
    return activity


def update_reporting_field_data(apps, schema_editor, field_name: str, update_data: dict) -> Optional[object]:
    """
    Update an existing ReportingField record based on the field_name.

    Args:
        field_name: The name of the field to update.
        update_data: A dictionary of fields to update on the ReportingField instance.

    Returns:
        The updated ReportingField instance if found, otherwise None.

    Raises:
        ReportingField.MultipleObjectsReturned: If multiple records match the field_name.
    """
    ReportingField = apps.get_model('reporting', 'ReportingField')

    try:
        reporting_field = ReportingField.objects.get(field_name=field_name)
    except ReportingField.DoesNotExist:
        return None

    for field, value in update_data.items():
        setattr(reporting_field, field, value)

    reporting_field.save()
    return reporting_field


# forward migration
def update_reporting_fields(apps, schema_editor):
    # applicable to all gas types
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Fuel Default High Heating Value",
        update_data={
            "field_display_title": "Default High Heating Value",
            "field_units": "GJ/Sm3 or GJ/kilolitre or GJ/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Fuel Annual Weighted Average High Heating Value",
        update_data={
            "field_display_title": "Annual Weighted Average High Heating Value",
            "field_units": "GJ/Sm3 or GJ/kilolitre or GJ/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel Annual Steam Generated",
        update_data={"field_units": "tonnes steam"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel Heat Input",
        update_data={"field_units": "GJ"},
    )
    # CO2-specific
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Default EF",
        update_data={
            "field_display_title": "CO2 Default Emission Factor",
            "field_units": "kgCO2/Sm3 or kgCO2/kilolitre or kgCO2/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Boiler Ratio",
        update_data={"field_units": "GJ/tonnes steam"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Annual Weighted Average Carbon Content",
        update_data={"field_units": "kg C/Sm3 or kg C/kilolitre or kg C/tonne"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Measured Steam-Measured EF",
        update_data={"field_display_title": "CO2 Measured Emission Factor", "field_units": "kgCO2/tonne steam"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Default HHV-Default EF",
        update_data={"field_display_title": "CO2 Default Emission Factor", "field_units": "kgCO2/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Measured HHV-Default EF",
        update_data={"field_display_title": "CO2 Default Emission Factor", "field_units": "kgCO2/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Measured Steam-Default EF",
        update_data={"field_display_title": "CO2 Default Emission Factor", "field_units": "kgCO2/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Fuel Annual Weighted Average Carbon Content (weight fraction)",
        update_data={
            "field_display_title": "Annual Weighted Average Carbon Content",
            "field_units": "kgC/Sm3 or kgC/kilolitre or kgC/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Annual Weighted Average Carbon Content",
        update_data={"field_display_title": "Annual Weighted Average Carbon Content (kg C/kg fuel)"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Annual Weighted Average Molecular Weight",
        update_data={"field_display_title": "Annual Weighted Average Molecular Weight (kg/kg-mole)"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Molar Volume Conversion Factor",
        update_data={"field_display_title": "Molar Volume Conversion Factor (Sm3/kg-mole)"},
    )
    # CH4-specific
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Default EF",
        update_data={
            "field_display_title": "CH4 Default Emission Factor",
            "field_units": "gCH4/Sm3 or gCH4/kilolitre or gCH4/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Default HHV-Default EF",
        update_data={"field_display_title": "CH4 Default Emission Factor", "field_units": "gCH4/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Heat Input-Default EF",
        update_data={"field_display_title": "CH4 Default Emission Factor", "field_units": "gCH4/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Measured EF",
        update_data={
            "field_display_title": "CH4 Measured Emission Factor",
            "field_units": "gCH4/Sm3 or gCH4/kilolitre or gCH4/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Measured HHV-Default EF",
        update_data={"field_display_title": "CH4 Default Emission Factor", "field_units": "gCH4/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Measured Steam-Default EF",
        update_data={"field_display_title": "CH4 Default Emission Factor", "field_units": "gCH4/GJ"},
    )
    # N2O-specific
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Default EF",
        update_data={
            "field_display_title": "N2O Default Emission Factor",
            "field_units": "gN2O/Sm3 or gN2O/kilolitre or gN2O/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Measured EF",
        update_data={
            "field_display_title": "N2O Measured Emission Factor",
            "field_units": "gN2O/Sm3 or gN2O/kilolitre or gN2O/tonne",
        },
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Default HHV-Default EF",
        update_data={"field_display_title": "N2O Default Emission Factor", "field_units": "gN2O/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Heat Input-Default EF",
        update_data={"field_display_title": "N2O Default Emission Factor", "field_units": "gN2O/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Measured HHV-Default EF",
        update_data={"field_display_title": "N2O Default Emission Factor", "field_units": "gN2O/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Measured Steam-Default EF",
        update_data={"field_display_title": "N2O Default Emission Factor", "field_units": "gN2O/GJ"},
    )


def update_slugs(apps, schema_editor):
    slug_mapping = [
        ('fuel_combustion_by_mobile', 'fuel_combustion_mobile'),
        ('ind_wastewater_processing', 'industrial_water_processing'),
        ('storage_petro_products', 'storage_of_petroleum_products'),
        ('carbonate_use', 'carbonates_use'),
        ('gsc_non_compression', 'gsc_non_compression_non_combustion'),
        ('natural_gas_activities_other_than_non_compression', 'ng_other_than_non_compression'),
        ('natural_gas_activities_non_compression', 'ng_non_compression'),
        ('og_activities_other_than_non_compression', 'og_extraction_other_than_ncnp'),
        ('og_activities_non_compression', 'og_extraction_non_compression'),
    ]
    for current_slug, new_slug in slug_mapping:
        update_activity_slug_name(apps, schema_editor, current_slug, new_slug)


def reload_activity_schema_data(apps, schema_editor):
    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')

    cwd = os.getcwd()

    ACTIVITY_SCHEMA_MAPPING = [
        'gsc_excluding_line_tracing',
        'gsc_solely_for_line_tracing',
        'gsc_other_than_non_compression',
        'refinery_fuel_gas',
        'carbonates_use',
        'gsc_non_compression_non_combustion',
        'hydrogen_production',
        'open_pit_coal_mining',
        'storage_of_petroleum_products',
        'aluminum_production',
        'ng_non_compression',
        'ng_other_than_non_compression',
        'lng_activities',
        'og_extraction_non_compression',
        'og_extraction_other_than_ncnp',
        'electricity_generation',
        'industrial_water_processing',
        'cement_production',
        'lime_manufacturing',
        'coal_storage',
        'zinc_production',
        'petroleum_refining',
        'lead_production',
        'electricity_transmission',
    ]

    for schema_slug in ACTIVITY_SCHEMA_MAPPING:
        schema_path = f'{cwd}/reporting/json_schemas/2024/{schema_slug}/activity.json'
        with open(schema_path) as schema_file:
            schema = json.load(schema_file)
            ActivitySchema.objects.filter(activity=Activity.objects.get(slug=schema_slug)).update(json_schema=schema)

    # also load the one json file in /2025 json_schemas
    schema_slug = 'pulp_and_paper'
    schema_path = f'{cwd}/reporting/json_schemas/2025/pulp_and_paper_production/activity.json'
    with open(schema_path) as schema_file:
        schema = json.load(schema_file)
        ActivitySchema.objects.filter(
            activity=Activity.objects.get(slug=schema_slug), valid_from=Configuration.objects.get(slug=2025)
        ).update(
            json_schema=schema,
        )


# reverse migration
def undo_update_reporting_fields(apps, schema_editor):
    # applicable to all gas types
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Fuel Default High Heating Value",
        update_data={"field_display_title": None, "field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Fuel Annual Weighted Average High Heating Value",
        update_data={"field_display_title": None, "field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel Annual Steam Generated",
        update_data={"field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel Heat Input",
        update_data={"field_units": None},
    )
    # CO2-specific
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Default EF",
        update_data={"field_display_title": "CO2 Default EF", "field_units": "kg/fuel units"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Boiler Ratio",
        update_data={"field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Annual Weighted Average Carbon Content",
        update_data={"field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Measured Steam-Measured EF",
        update_data={"field_display_title": "CO2 Measured Steam-Measured EF", "field_units": "kg/fuel units"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Default HHV-Default EF",
        update_data={"field_display_title": "CO2 Default HHV/Default EF", "field_units": "kg/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Measured HHV-Default EF",
        update_data={"field_display_title": "CO2 Measured HHV-Default EF", "field_units": "kg/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CO2 Measured Steam-Default EF",
        update_data={"field_display_title": "CO2 Measured Steam-Default EF", "field_units": "kg/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Fuel Annual Weighted Average Carbon Content (weight fraction)",
        update_data={"field_display_title": None, "field_units": "kg carbon/fuel unit"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Annual Weighted Average Carbon Content",
        update_data={"field_display_title": None, "field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Annual Weighted Average Molecular Weight",
        update_data={"field_display_title": None, "field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Molar Volume Conversion Factor",
        update_data={"field_display_title": None, "field_units": None},
    )
    # CH4-specific
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Default EF",
        update_data={"field_display_title": "CH4 Default EF", "field_units": "g/fuel units"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Default HHV-Default EF",
        update_data={"field_display_title": "CH4 Default HHV-Default EF", "field_units": "g/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Heat Input-Default EF",
        update_data={"field_display_title": "CH4 Heat Input-Default EF", "field_units": "g/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Measured EF",
        update_data={"field_display_title": "CH4 Measured EF", "field_units": "g/fuel units"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Measured HHV-Default EF",
        update_data={"field_display_title": "CH4 Measured HHV-Default EF", "field_units": "g/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-CH4 Measured Steam-Default EF",
        update_data={"field_display_title": "CH4 Measured Steam-Default EF", "field_units": "g/GJ"},
    )
    # N2O-specific
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Default EF",
        update_data={"field_display_title": "N2O Default EF", "field_units": None},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Measured EF",
        update_data={"field_display_title": "N2O Measured EF", "field_units": "g/fuel units"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Default HHV-Default EF",
        update_data={"field_display_title": "N2O Default HHV-Default EF", "field_units": "g/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Heat Input-Default EF",
        update_data={"field_display_title": "N2O Heat Input-Default EF", "field_units": "g/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Measured HHV-Default EF",
        update_data={"field_display_title": "N2O Measured HHV-Default EF", "field_units": "g/GJ"},
    )
    update_reporting_field_data(
        apps,
        schema_editor,
        field_name="Unit-Fuel-N2O Measured Steam-Default EF",
        update_data={"field_display_title": "N2O Measured Steam-Default EF", "field_units": "g/GJ"},
    )


def update_reporting_field_data_2(apps, schema_editor, slug_name: str, update_data: dict):
    """
    Update an existing ReportingField record based on the slug.

    Args:
        slug_name: The slug of the field to update.
        update_data: A dictionary of fields to update on the ReportingField instance.

    Returns:
        The updated ReportingField instance if found, otherwise None.

    Raises:
        ReportingField.MultipleObjectsReturned: If multiple records match the field_name.
    """
    ReportingField = apps.get_model('reporting', 'ReportingField')

    try:
        reporting_field = ReportingField.objects.get(slug=slug_name)
    except ReportingField.DoesNotExist:
        return None

    for field, value in update_data.items():
        setattr(reporting_field, field, value)

    reporting_field.save()


# forward migrations
def update_reporting_fields_2(apps, schema_editor):
    update_reporting_field_data_2(
        apps,
        schema_editor,
        slug_name="unitFuelCo2SiteSpecificEf",
        update_data={
            "field_display_title": "CO2 Site-specific Emission Factor",
            "field_units": "kgCO2/Sm3 or kgCO2/kilolitre or kgCO2/tonne",
        },
    )
    update_reporting_field_data_2(
        apps,
        schema_editor,
        slug_name="unitFuelCh4SiteSpecificEf",
        update_data={
            "field_display_title": "CH4 Site-specific Emission Factor",
            "field_units": "gCH4/Sm3 or gCH4/kilolitre or gCH4/tonne",
        },
    )
    update_reporting_field_data_2(
        apps,
        schema_editor,
        slug_name="unitFuelN2OSiteSpecificEf",
        update_data={
            "field_display_title": "N2O Site-specific Emission Factor",
            "field_units": "gN2O/Sm3 or gN2O/kilolitre or gN2O/tonne",
        },
    )


def populate_naics_code(apps, schema_editor):
    import common.lib.pgtrigger as pgtrigger

    ReportOperation = apps.get_model("reporting", "ReportOperation")
    for report_op in ReportOperation.objects.select_related("report_version__report__operation").all():
        operation = report_op.report_version.report.operation
        if operation.naics_code_id and not report_op.naics_code_id:
            with pgtrigger.ignore('reporting.ReportOperation:immutable_report_version'):
                report_op.naics_code_id = operation.naics_code_id
                report_op.save(update_fields=["naics_code_id"])


def update_fuel_amount_ranges(apps, schema_editor):
    ExpectedValueRangeFuelAmount = apps.get_model('reporting', 'ExpectedValueRangeFuelAmount')
    FuelType = apps.get_model('reporting', 'FuelType')

    diesel = FuelType.objects.get(name='Diesel')
    ExpectedValueRangeFuelAmount.objects.filter(fuel_type=diesel).update(upper_bound=Decimal('200000.00'))

    natural_gas = FuelType.objects.get(name='Natural Gas')
    ExpectedValueRangeFuelAmount.objects.filter(fuel_type=natural_gas).update(upper_bound=Decimal('200000000.00'))


def revert_fuel_amount_ranges(apps, schema_editor):
    ExpectedValueRangeFuelAmount = apps.get_model('reporting', 'ExpectedValueRangeFuelAmount')
    FuelType = apps.get_model('reporting', 'FuelType')

    diesel = FuelType.objects.get(name='Diesel')
    ExpectedValueRangeFuelAmount.objects.filter(fuel_type=diesel).update(upper_bound=Decimal('5000.00'))

    natural_gas = FuelType.objects.get(name='Natural Gas')
    ExpectedValueRangeFuelAmount.objects.filter(fuel_type=natural_gas).update(upper_bound=Decimal('5000000.00'))


def populate_missing_report_version_fields(apps, schema_editor):
    import common.lib.pgtrigger as pgtrigger

    def report_new_entrant_emission_populate_report_version(apps, schema_editor):
        ReportNewEntrantEmission = apps.get_model('reporting', 'ReportNewEntrantEmission')
        for record in ReportNewEntrantEmission.objects.all():
            report_version_id = record.report_new_entrant.report_version_id
            if not record.report_version_id:
                with pgtrigger.ignore('reporting.ReportNewEntrantEmission:immutable_report_version'):
                    record.report_version_id = report_version_id
                    record.save(update_fields=['report_version_id'])

    def report_new_entrant_production_populate_report_version(apps, schema_editor):
        ReportNewEntrantProduction = apps.get_model('reporting', 'ReportNewEntrantProduction')
        for record in ReportNewEntrantProduction.objects.all():
            report_version_id = record.report_new_entrant.report_version_id
            if not record.report_version_id:
                with pgtrigger.ignore('reporting.ReportNewEntrantProduction:immutable_report_version'):
                    record.report_version_id = report_version_id
                    record.save(update_fields=['report_version_id'])

    def report_raw_activity_data_populate_report_version(apps, schema_editor):
        ReportRawActivityData = apps.get_model('reporting', 'ReportRawActivityData')
        for record in ReportRawActivityData.objects.all():
            report_version_id = record.facility_report.report_version_id
            if not record.report_version_id:
                with pgtrigger.ignore('reporting.ReportRawActivityData:immutable_report_version'):
                    record.report_version_id = report_version_id
                    record.save(update_fields=['report_version_id'])

    report_new_entrant_emission_populate_report_version(apps, schema_editor)
    report_new_entrant_production_populate_report_version(apps, schema_editor)
    report_raw_activity_data_populate_report_version(apps, schema_editor)


def remove_2023_ry(apps, schema_editor):
    ReportingYear = apps.get_model('reporting', 'ReportingYear')
    ReportingYear.objects.filter(reporting_year=2023).delete()


def revert_2023_ry(apps, schema_editor):
    ReportingYear = apps.get_model('reporting', 'ReportingYear')
    ReportingYear.objects.create(
        reporting_year=2023,
        reporting_window_start="2024-01-01T00:00:00.000-08",
        reporting_window_end="2024-12-31T23:59:59.999-08",
        report_due_date="2024-05-31T23:59:59.999-07",
        report_open_date="2024-02-29T16:00:00.000-08",
    )
