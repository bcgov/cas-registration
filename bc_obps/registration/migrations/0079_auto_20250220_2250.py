# Generated by Django 5.0.11 on 2025-02-20 22:50

from django.db import migrations
from typing import Dict

"""
One-time forward-only migration to be applied to prod data.
Purpose: set the `registration_purpose` field of Operations to OBPS Regulated Operation if the registration was assigned a BORO ID in Reg1.
"""


def count_stats(Operation) -> Dict[str, int]:
    total = Operation.objects.count()
    has_boro_id = Operation.objects.filter(bc_obps_regulated_operation__isnull=False).count()
    has_registration_purpose = Operation.objects.filter(registration_purpose__isnull=False).count()
    has_regulated_purpose = Operation.objects.filter(registration_purpose='OBPS Regulated Operation').count()

    return {
        'total': total,
        'has_boro_id': has_boro_id,
        'has_registration_purpose': has_registration_purpose,
        'has_regulated_purpose': has_regulated_purpose,
    }


def migrate_assign_regulated_purpose(apps, schema_monitor):
    # import the required Django model
    Operation = apps.get_model('registration', 'Operation')

    before_stats = count_stats(Operation)
    print(f'before_stats: {before_stats}')

    for operation in Operation.objects.all():
        if operation.bc_obps_regulated_operation is not None:
            operation.registration_purpose = 'OBPS Regulated Operation'
            operation.save(update_fields=['registration_purpose'])

    after_stats = count_stats(Operation)
    print(f'after_stats: {after_stats}')

    assert before_stats.get('total') == after_stats.get('total')
    assert after_stats.get('has_boro_id') == after_stats.get('has_registration_purpose')
    assert after_stats.get('has_boro_id') == after_stats.get('has_regulated_purpose')


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0078_V1_22_0'),
    ]

    operations = [migrations.RunPython(migrate_assign_regulated_purpose, migrations.RunPython.noop, elidable=True)]
