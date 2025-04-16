# Generated by Django 5.0.14 on 2025-04-16 20:11

from django.db import migrations
import os
import json


def update_storage_of_petroleum_products(apps, schema_editor):
    cwd = os.getcwd()
    schema_path = os.path.join(
        cwd, 'reporting/json_schemas/2024/storage_of_petroleum_products/above_ground_storage_tanks.json'
    )
    with open(schema_path) as storage_of_petroleum:
        schema = json.load(storage_of_petroleum)

    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')

    activity_id = Activity.objects.get(name='Storage of petroleum products').id
    source_type_id = SourceType.objects.get(name='Above-ground storage tanks').id
    valid_from_id = Configuration.objects.get(valid_from='2023-01-01').id
    valid_to_id = Configuration.objects.get(valid_to='2099-12-31').id

    ActivitySourceTypeSchema.objects.filter(
        activity_id=activity_id, source_type_id=source_type_id, valid_from_id=valid_from_id, valid_to_id=valid_to_id
    ).update(json_schema=schema)


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0086_update_fugitive_sources_schema'),
    ]

    operations = [migrations.RunPython(update_storage_of_petroleum_products)]
