# Generated by Django 5.0.11 on 2025-03-11 16:34

from django.db import migrations

"""
One-time forward-only migration to be applied to prod data.
Purpose: Remove the point_of_contact (created in Reg1) from the `operation` model and instead relate this contact to operations via contact.operator and the operation_contacts model.
"""


def migrate_point_of_contact(apps, schema_monitor):
    '''
    Migrate operation.point_of_contact to operation_contacts and contact.operator
    '''
    Operation = apps.get_model('registration', 'Operation')

    operations = Operation.objects.all()

    for operation in operations:
        if operation.point_of_contact:
            operation.contacts.add(operation.point_of_contact)
            operation.operator.contacts.add(operation.point_of_contact)


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0082_remove_facilitydesignatedoperationtimeline_status_and_more'),
    ]

    operations = [
        migrations.RunPython(migrate_point_of_contact, migrations.RunPython.noop, elidable=True),
    ]
