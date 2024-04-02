from django.db import migrations


def add_naics_code_32519(apps, schema_monitor):
    '''
    Add naics_code '325190 - Other basic organic chemical manufacturing' to erc.naics_code
    '''
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    NaicsCode.objects.create(naics_code='325190', naics_description='Other basic organic chemical manufacturing')


def reverse_add_naics_code_32519(apps, schema_monitor):
    '''
    Remove initial data from erc.naics_code
    '''
    NaicsCode = apps.get_model('registration', 'NaicsCode')
    NaicsCode.objects.filter(
        naics_code__in=[
            '325190',
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('registration', '0005_V1_2_0'),
    ]

    operations = [
        migrations.RunPython(add_naics_code_32519, reverse_add_naics_code_32519),
    ]
