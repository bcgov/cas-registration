import json
import os


def reload_source_type_schemas_from_json(apps, schema_editor, schema_path, activity_name, source_type_name):
    """
    Helper function to reload source type schemas from JSON files.

    :param apps: The apps registry.
    :param schema_editor: The schema editor.
    :param schema_path: The path to the JSON schema file.
    :param activity_name: The name of the activity associated with the source type.
    :param source_type_name: The name of the source type to update.
    """

    ActivitySourceTypeJsonSchema = apps.get_model("reporting", "ActivitySourceTypeJsonSchema")
    Activity = apps.get_model("registration", "Activity")
    SourceType = apps.get_model("reporting", "SourceType")

    with open(os.path.join(os.getcwd(), schema_path)) as f:
        schema = json.load(f)

    ActivitySourceTypeJsonSchema.objects.filter(
        activity=Activity.objects.get(name=activity_name),
        source_type=SourceType.objects.get(name=source_type_name),
    ).update(json_schema=schema)


def load_activity_schemas_from_json(apps, schema_editor, schema_path, activity_name):
    """
    Helper function to load activity source type JSON schemas.

    :param apps: The apps registry.
    :param schema_editor: The schema editor.
    :param schema_path: The path to the JSON schema file.
    :param activity_name: The name of the activity associated with the source type.
    """
    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')

    valid_from_start_2023 = Configuration.objects.get(valid_from='2023-01-01')
    valid_to_end_2099 = Configuration.objects.get(valid_to='2099-12-31')
    cwd = os.getcwd()

    ACTIVITY_SCHEMA_MAPPING = [
        ('General stationary combustion excluding line tracing', 'gsc_excluding_line_tracing'),
        ('General stationary combustion solely for the purpose of line tracing', 'gsc_solely_for_line_tracing'),
        ('Fuel combustion by mobile equipment', 'fuel_combustion_mobile'),
        (
            'General stationary combustion, other than non-compression and non-processing combustion',
            'gsc_other_than_non_compression',
        ),
        ('Refinery fuel gas combustion', 'refinery_fuel_gas'),
        ('Carbonate use', 'carbonates_use'),
        ('General stationary non-compression and non-processing combustion', 'gsc_non_compression_non_combustion'),
        ('Hydrogen production', 'hydrogen_production'),
        ('Pulp and paper production', 'pulp_and_paper_production'),
        ('Open pit coal mining', 'open_pit_coal_mining'),
        ('Storage of petroleum products', 'storage_of_petroleum_products'),
        ('Aluminum or alumina production', 'aluminum_production'),
        (
            'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
            'ng_non_compression',
        ),
        (
            'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
            'ng_other_than_non_compression',
        ),
        ('LNG activities', 'lng_activities'),
        (
            'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
            'og_extraction_non_compression',
        ),
        (
            'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
            'og_extraction_other_than_ncnp',
        ),
        ('Electricity generation', 'electricity_generation'),
        ('Industrial wastewater processing', 'industrial_water_processing'),
        ('Cement production', 'cement_production'),
        ('Lime manufacturing', 'lime_manufacturing'),
        ('Coal storage at facilities that combust coal', 'coal_storage'),
        ('Zinc production', 'zinc_production'),
        ('Petroleum refining', 'petroleum_refining'),
        ('Lead production', 'lead_production'),
        ('Electricity transmission', 'electricity_transmission'),
    ]

    ACTIVITY_SCHEMA_MAPPING_2025 = [('Pulp and paper production', 'pulp_and_paper_production')]

    for activity_name, schema_slug in ACTIVITY_SCHEMA_MAPPING:
        schema_path = f'{cwd}/reporting/json_schemas/2024/{schema_slug}/activity.json'
        with open(schema_path) as schema_file:
            schema = json.load(schema_file)
        ActivitySchema.objects.create(
            activity=Activity.objects.get(name=activity_name),
            json_schema=schema,
            valid_from=valid_from_start_2023,
            valid_to=valid_to_end_2099,
        )

    # Schemas for 2025 reporting year
    valid_from_start_2025 = Configuration.objects.get(valid_from='2025-01-01')
    valid_to_end_2024 = Configuration.objects.get(valid_to='2024-12-31')
    for activity_name, schema_slug in ACTIVITY_SCHEMA_MAPPING_2025:
        schema_path = f'{cwd}/reporting/json_schemas/2025/{schema_slug}/activity.json'
        with open(schema_path) as schema_file:
            schema = json.load(schema_file)
        # first fetch the existing schema object for the activity and update the valid_to date to end of 2024
        activity_schema_object = ActivitySchema.objects.filter(
            activity=Activity.objects.get(name=activity_name),
            valid_from=valid_from_start_2023,
            valid_to=valid_to_end_2099,
        ).first()
        activity_schema_object.update(
            valid_to=valid_to_end_2024,
        )
        # then create a new schema object with the updated schema and valid_from date of start of 2025
        ActivitySchema.objects.create(
            activity=Activity.objects.get(name=activity_name),
            json_schema=schema,
            valid_from=valid_from_start_2025,
            valid_to=valid_to_end_2099,
        )
