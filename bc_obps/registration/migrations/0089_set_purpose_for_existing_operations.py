# Generated by Django 5.0.13 on 2025-03-12 17:08

from django.db import migrations

"""
One-time forward-only migration to be applied to prod data.
Purpose: set the `registration_purpose` field of Operations to OBPS Regulated Operation if the registration was assigned a BORO ID in Reg1.
"""


def migrate_assign_regulated_purpose(apps, schema_monitor):
    # import the required Django model
    Operation = apps.get_model('registration', 'Operation')

    for operation in Operation.objects.filter(bc_obps_regulated_operation__isnull=False):
        if operation.opt_in:
            operation.registration_purpose = 'Opted-in Operation'
        else:
            operation.registration_purpose = 'OBPS Regulated Operation'
        operation.save(update_fields=['registration_purpose'])


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0088_contact_unique_email_per_operator'),
    ]

    operations = [migrations.RunPython(migrate_assign_regulated_purpose, migrations.RunPython.noop, elidable=True)]
