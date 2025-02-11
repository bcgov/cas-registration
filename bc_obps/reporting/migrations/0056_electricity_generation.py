# Generated by Django 5.0.11 on 2025-02-07 18:48

import json
from django.db import migrations


#### ACTIVITY RULES ####

# Configuration constants
ACTIVITY = "Electricity generation"
VALID_FROM= "2023-01-01"
VALID_TO= "2099-12-31"

# Configuration of valid combinations of the models
CONFIG_VALID_RELATIONSHIPS = [
        # Fuel combustion for electricity generation
        {
            "activity": ACTIVITY,
            "source_type": "Fuel combustion for electricity generation",
            "gas_types": ["CO2", "CH4", "N2O"],
            "methodologies": ["CEMS", "Measured CC and MW", "Alternative Parameter Measurement", "Replacement Methodology"],
        },
        # Acid gas scrubbers and acid gas reagents
        {
            "activity": ACTIVITY,
            "source_type": "Acid gas scrubbers and acid gas reagents",
            "gas_types": ["CO2"],
            "methodologies": ["Acid gas", "Alternative Parameter Measurement", "Replacement Methodology"],
        },
        # Cooling units
        {
            "activity": ACTIVITY,
            "source_type": "Cooling units",            
            "gas_types": [
                "HFC-23 (CHF3)",
                "HFC-32 (CH2F2)",
                "HFC-41 (CH3F)",
                "HFC-43-10mee (C5H2F10)",
                "HFC-125 (C2HF5)",
                "HFC-134 (C2H2F4)",
                "HFC-134a (C2H2F4)",
                "HFC-143 (C2H3F3)",
                "HFC-143a (C2H3F3)",
                "HFC-152a (C2H4F2)",
                "HFC-227ea (C3HF7)",
                "HFC-236fa (C3H2F6)",
                "HFC-245ca (C3H3F5)"
            ],      
            "methodologies": ["Mass balance", "Alternative Parameter Measurement", "Replacement Methodology"],
        },
        # Geothermal geyser steam or fluids
        {
            "activity": ACTIVITY,
            "source_type": "Geothermal geyser steam or fluids",
            "gas_types": ["CO2"],
            "methodologies": ["Measured heat", "Alternative Parameter Measurement", "Replacement Methodology"],
        },
        # Installation maintenance...
        {
            "activity": ACTIVITY,
            "source_type": "Installation, maintenance, operation and decommissioning of electrical equipment",
            "gas_types": ["SF6"],
            "methodologies": ["Mass balance", "Direct measurement", "Alternative Parameter Measurement", "Replacement Methodology"],
        },
    ]

# Configuration of reporting fields configuration data associated with source_type, gas_type, methodology
CONFIG_REPORTING_FIELDS = [
        # Fuel combustion for electricity generation
        {
            "source_type": "Fuel combustion for electricity generation",
            "gas_types": ["CO2"],
            "methodologies": ["Measured CC and MW"],
            "reporting_fields": [
                "Annual Weighted Average Carbon Content",
                "Annual Weighted Average Molecular Weight",
                "Molar Volume Conversion Factor",
            ],
        },
        # Acid gas scrubbers and acid gas reagents
        {
            "source_type": "Acid gas scrubbers and acid gas reagents",
            "gas_types": ["CO2"],
            "methodologies": [
                "Alternative Parameter Methodology",
                "Replacement Methodology",
            ],
            "reporting_fields": ["Description"],
        },
        # Cooling units
        {
            "source_type": "Cooling units",
            "gas_types": [
                "HFC-23 (CHF3)",
                "HFC-32 (CH2F2)",
                "HFC-41 (CH3F)",
                "HFC-43-10mee (C5H2F10)",
                "HFC-125 (C2HF5)",
                "HFC-134 (C2H2F4)",
                "HFC-134a (C2H2F4)",
                "HFC-143 (C2H3F3)",
                "HFC-143a (C2H3F3)",
                "HFC-152a (C2H4F2)",
                "HFC-227ea (C3HF7)",
                "HFC-236fa (C3H2F6)",
                "HFC-245ca (C3H3F5)"
            ],      
            "methodologies": [
                "Mass balance",
                "Alternative Parameter Measurement",
                "Replacement Methodology"
            ],
            "reporting_fields": ["Description"],
        },
        # Geothermal geyser steam or fluids
        {
            "source_type": "Geothermal geyser steam or fluids",
            "gas_types": ["CO2"],
            "methodologies": [
                "Alternative Parameter Methodology",
                "Replacement Methodology",
            ],
            "reporting_fields": ["Description"],
        },
        # Installation maintenance...
        {
            "source_type": "Installation, maintenance, operation and decommissioning of electrical equipment",
            "gas_types": ["SF6"],
            "methodologies": [
                "Alternative Parameter Methodology",
                "Replacement Methodology",
            ],
            "reporting_fields": ["Description"],
        },
    ]

# Configuration of schema files related to activity source types:
# 1. JSON schema file name (str) – Identifier for the schema file.
# 2. Source type name (str) – Human-readable name of the source type.
# 3. has_unit (bool) – Indicates if the source type is associated with a unit.
# 4. has_fuel (bool) – Indicates if the source type involves fuel usage.
CONFIG_SOURCE_TYPE_SCHEMA =[
        (
            "1_fuel_combustion_electricity_gen",
            "Fuel combustion for electricity generation",
            True,
            True,
        ),
        (
            "2_acid_gas_scrubbers_reagents",
            "Acid gas scrubbers and acid gas reagents",
            False,
            True,
        ),
        (
            "3_cooling_units",
            "Cooling units",
            False,
            True,
        ),
        (
            "4_geothermal_geyser_steam_fluids",
            "Geothermal geyser steam or fluids",
            False,
            True,
        ),
        (
            "5_electrical_equipment_install_maint_decom",
            "Installation, maintenance, operation and decommissioning of electrical equipment",
            True,
            False,
        ),
    ]

JSON_SCHEMAS_PATH = "reporting/json_schemas/2024/electricity_generation"

#### ADDITIONAL DATA: GAS TYPES ####

def init_additional_gas_type_data(apps, schema_editor):
    """
    Add additional gas types to erc.gas_type
    """
    # Retrieve models from the app registry to interact with the database
    GasType = apps.get_model('reporting', 'GasType')

    # List of gas types with their respective details
    gas_types_data = [
        {"name": "Trifluoromethane", "chemical_formula": "HFC-23 (CHF3)", "cas_number": "75-46-7", "gwp": 12400},
        {"name": "Fluoromethane", "chemical_formula": "HFC-41 (CH3F)", "cas_number": "593-53-3", "gwp": 116},
        {"name": "1,1,1,2,3,4,4,5,5,5-decafluoropentane", "chemical_formula": "HFC-43-10mee (C5H2F10)", "cas_number": "138495-42-8", "gwp": 1650},
        {"name": "1,1,2,2-tetrafluoroethane", "chemical_formula": "HFC-134 (C2H2F4)", "cas_number": "359-35-3", "gwp": 1120},
        {"name": "1,1,2-trifluoroethane", "chemical_formula": "HFC-143 (C2H3F3)", "cas_number": "430-66-0", "gwp": 328},
        {"name": "1,1,1-trifluoroethane", "chemical_formula": "HFC-143a (C2H3F3)", "cas_number": "420-46-2", "gwp": 4800},
        {"name": "1,1-difluoroethane", "chemical_formula": "HFC-152a (C2H4F2)", "cas_number": "75-37-6", "gwp": 138},
	    {"name": "1,1,1,2,3,3,3-heptafluoro-propane", "chemical_formula": "HFC-227ea (C3HF7)", "cas_number": "431-89-0", "gwp": 3350},
        {"name": "1,1,1,3,3,3-hexafluoro-propane", "chemical_formula": "HFC-236fa (C3H2F6)", "cas_number": "690-39-1", "gwp": 8060},
        {"name": "1,1,2,2,3-pentafluoro-propane", "chemical_formula": "HFC-245ca (C3H3F5)", "cas_number": "679-86-7", "gwp": 716},
       ]  

    # Bulk creation of GasType records
    GasType.objects.bulk_create(
            [GasType(**data) for data in gas_types_data]
            )

def reverse_additional_gas_type_data(apps, schema_editor):
    """
    Remove additional gas_type data from erc.gas_type
    """
    GasType = apps.get_model('reporting', 'GasType')
    chemical_formulas = [
        "C3H3F5", "CH3F", "C2H4F2 (Structure: CH3CHF2)", "C5H2F10", 
        "C2H3F3 (Structure: CHF2CH2F)", "C2H3F3 (Structure: CF3CH3)", "CHF3", "C3HF7", "C3H2F6"
    ]

    GasType.objects.filter(chemical_formula__in=chemical_formulas).delete()
 
def init_update_gas_type_data(apps, schema_editor):
    """
    Update erc.gas_type with distinct chemical formula
    """
    GasType = apps.get_model('reporting', 'GasType')

    # Update chemical formulas
    g = GasType.objects.get(chemical_formula='CH2F2')
    g.chemical_formula = 'HFC-32 (CH2F2)'
    g.save()

    g = GasType.objects.get(chemical_formula='C2HF5')
    g.chemical_formula = 'HFC-125 (C2HF5)'
    g.save()

    g = GasType.objects.get(chemical_formula='C2H2F4')
    g.chemical_formula = 'HFC-134a (C2H2F4)'
    g.save()    

def reverse_update_gas_type_data(apps, schema_editor):
    """
    Reverse the chemical formula update
    """
    GasType = apps.get_model('reporting', 'GasType')

    # Revert chemical formulas to their original values
    g = GasType.objects.get(chemical_formula='HFC-32 (CH2F2)')
    g.chemical_formula = 'CH2F2'
    g.save()

    g = GasType.objects.get(chemical_formula='HFC-125 (C2HF5)')
    g.chemical_formula = 'C2HF5'
    g.save()

#### ADDITIONAL DATA: METHODOLOGIES ####

def init_additional_methodology_data(apps, schema_editor):
    """
    Add additional data to erc.methodology
    """
    Methodology = apps.get_model("reporting", "Methodology")
    Methodology.objects.bulk_create(
        [
            Methodology(name="Acid gas"),
            Methodology(name="Direct measurement"),
            Methodology(name="Mass balance"),
            Methodology(name="Measured heat"),
        ]
    )

def reverse_additional_methodology_data(apps, schema_editor):
    """
    Remove additional data from erc.methodology
    """
    Methodology = apps.get_model("reporting", "Methodology")
    Methodology.objects.filter(
        name__in=[
            "Acid gas",
            "Direct measurement",
            "Mass balance",
            "Measured heat",
        ]
    ).delete()

#### CONFIGURATION ELEMENTS DATA ####
    
def init_configuration_element_data(apps, schema_editor):
    """
    Initialize ConfigurationElement records based on predefined configurations, 
    including the activity, source type, gas types, methodologies, and valid date ranges.
    """
    # Retrieve models from the app registry to interact with the database
    ConfigurationElement = apps.get_model("reporting", "ConfigurationElement")
    Activity = apps.get_model("registration", "Activity")
    SourceType = apps.get_model("reporting", "SourceType")
    GasType = apps.get_model("reporting", "GasType")
    Methodology = apps.get_model("reporting", "Methodology")
    Configuration = apps.get_model("reporting", "Configuration")
    
    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

    # Iterate through the relationships configuration json for the different source types
    for config in CONFIG_VALID_RELATIONSHIPS:
        # Retrieve the source type from the database based on its name
        source_type = SourceType.objects.get(name=config["source_type"])

        # Bulk create ConfigurationElement entries for each combination of gas type and methodology
        ConfigurationElement.objects.bulk_create(
            ConfigurationElement(
                activity=activity,
                source_type=source_type,
                gas_type=GasType.objects.get(chemical_formula=gas_type),
                methodology=Methodology.objects.get(name=methodology_name),
                valid_from=valid_from,
                valid_to=valid_to,
            )
            for gas_type in config["gas_types"]  # Iterate through the gas types for each config
            for methodology_name in config["methodologies"]  # Iterate through the methodologies for each config
        )

def reverse_configuration_element_data(apps, schema_editor):    
    """
    Remove ConfigurationElements for the report activity
    """
    # Retrieve models from the app registry to interact with the database
    ConfigurationElement = apps.get_model("reporting", "ConfigurationElement")
    Activity = apps.get_model("registration", "Activity")
    Configuration = apps.get_model("reporting", "Configuration")
    
    # Fetch the const configurations
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

    # Remove configurations
    ConfigurationElement.objects.filter(
        activity=activity,
        valid_from=valid_from,
        valid_to=valid_to,
    ).delete()

#### CONFIGURATION ELEMENTS REPORTING FIELDS DATA ####

def init_configuration_element_reporting_fields_data(apps, schema_editor):
    """
    Initialize ConfigurationElement records and associate them with reporting fields
    based on predefined configurations and conditions.
    """
    # Retrieve models from the app registry to interact with the database
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ReportingField = apps.get_model('reporting', 'ReportingField')

    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

    # Iterate through the reporting fields configuration json for the different source types
    for config in CONFIG_REPORTING_FIELDS:
        # Fetch the source type from the database based on the given name
        source_type = SourceType.objects.get(name=config["source_type"])
        # Iterate through each gas type specified for the source type
        for gas_type_name in config["gas_types"]:
            # Fetch the gas type object based on its chemical formula
            gas_type = GasType.objects.get(chemical_formula=gas_type_name)
            # Fetch the methodologies related to this configuration
            methodologies = Methodology.objects.filter(name__in=config["methodologies"])

            # Create ConfigurationElement entries for each methodology associated with the current gas type and source type
            for methodology in methodologies:
                configuration_element, _ = ConfigurationElement.objects.get_or_create(
                    activity=activity,
                    source_type=source_type,
                    gas_type=gas_type,
                    methodology=methodology,
                    valid_from=valid_from,
                    valid_to=valid_to,
                )

                # For each reporting field defined in the config, associate it with the ConfigurationElement
                for field_name in config["reporting_fields"]:
                    reporting_field = ReportingField.objects.get(field_name=field_name)
                    configuration_element.reporting_fields.add(reporting_field)

def reverse_configuration_element_reporting_fields_data(apps, schema_editor):
    """
    Remove reporting field associations from ConfigurationElement for specific configurations.
    """
    # Retrieve models from the app registry to interact with the database
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')

    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

    # Iterate through the reporting fields configuration json and clear reporting field associations
    for config in CONFIG_REPORTING_FIELDS:
        source_type = SourceType.objects.get(name=config["source_type"])

        for gas_type_name in config["gas_types"]:
            gas_type = GasType.objects.get(chemical_formula=gas_type_name)

            # Filter methodologies
            methodologies = Methodology.objects.filter(name__in=config["methodologies"])

            # Find the matching configuration elements and clear reporting fields
            for methodology in methodologies:
                configuration_elements = ConfigurationElement.objects.filter(
                    activity=activity,
                    source_type=source_type,
                    gas_type=gas_type,
                    methodology=methodology,
                    valid_from=valid_from,
                    valid_to=valid_to,
                )
                for element in configuration_elements:
                    element.reporting_fields.clear()

#### ACTIVITY SCHEMA ####

def init_activity_schema_data(apps, schema_monitor):
    """
    Add activity schema data to erc.activity_schema
    """
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(f"{cwd}/{JSON_SCHEMAS_PATH}/activity.json") as activity_file:
        schema = json.load(activity_file)
    
    # Retrieve models from the app registry to interact with the database
    ActivitySchema = apps.get_model("reporting", "ActivityJsonSchema")
    Activity = apps.get_model("registration", "Activity")
    Configuration = apps.get_model("reporting", "Configuration")

    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)
  
   # Create activity schema
    ActivitySchema.objects.create(
        activity=activity,
        json_schema=schema,
        valid_from=valid_from,
        valid_to=valid_to,
    )

def reverse_activity_schema_data(apps, schema_monitor):
    """  
    Remove Activity schema data
    """
    # Retrieve models from the app registry to interact with the database
    Activity = apps.get_model("registration", "Activity")
    ActivitySchema = apps.get_model("reporting", "ActivityJsonSchema")
    Configuration = apps.get_model("reporting", "Configuration")

    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

   # Delete the schema
    ActivitySchema.objects.get(
        activity=activity,
        valid_from=valid_from,
        valid_to=valid_to,
    ).delete()

#### ACTIVITY SOURCE TYPE SCHEMAS ####

def init_activity_source_type_schema_data(apps, schema_monitor):
    """
    Add activity source type schema data to erc.activity_schema
    """
    # Import JSON data
    import os

    cwd = os.getcwd()

    # Retrieve models from the app registry to interact with the database
    ActivitySourceTypeSchema = apps.get_model("reporting", "ActivitySourceTypeJsonSchema")
    Activity = apps.get_model("registration", "Activity")
    SourceType = apps.get_model("reporting", "SourceType")
    Configuration = apps.get_model("reporting", "Configuration")

    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

    # Iterate through the source type schema configuration json 
    for element in CONFIG_SOURCE_TYPE_SCHEMA:
        (file_name, st_name, has_unit, has_fuel) = element

        with open(f"{cwd}/{JSON_SCHEMAS_PATH}/{file_name}.json") as schema_file:
            schema = json.load(schema_file)

        ActivitySourceTypeSchema.objects.create(
            activity=activity,
            source_type=SourceType.objects.get(name=st_name),
            has_unit=has_unit,
            has_fuel=has_fuel,
            json_schema=schema,
            valid_from=valid_from,
            valid_to=valid_to,
        )

def reverse_activity_source_type_schema_data(apps, schema_monitor):
    """
    Remove Activity SourceType schema data
    """

    # Retrieve models from the app registry to interact with the database
    ActivitySourceTypeSchema = apps.get_model("reporting", "ActivitySourceTypeJsonSchema")
    Activity = apps.get_model("registration", "Activity")
    Configuration = apps.get_model("reporting", "Configuration")

    # Fetch the configuration constants
    activity = Activity.objects.get(name=ACTIVITY)
    valid_from = Configuration.objects.get(valid_from=VALID_FROM)
    valid_to = Configuration.objects.get(valid_to=VALID_TO)

   # Delete the schema
    ActivitySourceTypeSchema.objects.filter(
        activity=activity,
        valid_from=valid_from,
        valid_to=valid_to,
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("reporting", "0055_liquefied_natural_gas"),
    ]

    operations = [
        migrations.RunPython(
            init_update_gas_type_data,
            reverse_update_gas_type_data,
        ),
        migrations.RunPython(
            init_additional_gas_type_data,
            reverse_additional_gas_type_data,
        ),
        migrations.RunPython(
            init_additional_methodology_data,
            reverse_additional_methodology_data,
        ),
        migrations.RunPython(
            init_configuration_element_data,
            reverse_configuration_element_data,
        ),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data,
            reverse_configuration_element_reporting_fields_data,
        ),
        migrations.RunPython(init_activity_schema_data, reverse_activity_schema_data),
        migrations.RunPython(
            init_activity_source_type_schema_data,
            reverse_activity_source_type_schema_data,
        ),
    ]
