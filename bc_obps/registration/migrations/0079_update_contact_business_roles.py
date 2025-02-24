# Generated by Django 5.0.11 on 2025-02-13 23:35
from typing import Dict
from django.db import migrations

"""
One-time forward-only migration to be applied to prod data.
Purpose: Replace Operation Registration Lead with Operation Representative business fole for contacts. Delete Operation Registration Lead from BusinessRole model.
"""


def count_stats(Contact) -> Dict[str, int]:
    """Collects and returns key statistics about the data before and after migration."""
    return {
        'total_contacts_with_opl_role': Contact.objects.filter(business_role='Operation Registration Lead'),
        'total_contacts_with_other_role': Contact.objects.exclude(business_role='Operation Registration Lead'),
        'total_contacts': Contact.objects.count(),
    }


def migrate_business_roles(apps, schema_monitor):

    Contact = apps.get_model('registration', 'Contact')
    BusinessRole = apps.get_model('registration', 'BusinessRole')

    before_stats = count_stats(Contact)

    Contact.objects.filter(business_role='Operation Registration Lead').update(business_role='Operation Representative')

    BusinessRole.objects.get(role_name='Operation Registration Lead').delete()

    after_stats = count_stats(Contact)

    assert before_stats['total_contacts'] == after_stats['total_contacts']
    assert Contact.objects.filter(business_role='Operation Registration Lead').count() == 0
    assert BusinessRole.objects.filter(role_name='Operation Registration Lead').count() == 0


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0078_V1_22_0'),
    ]

    operations = [
        migrations.RunPython(migrate_business_roles, migrations.RunPython.noop, elidable=True),
    ]
