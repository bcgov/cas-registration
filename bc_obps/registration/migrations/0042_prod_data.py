# Generated by Django 4.2.8 on 2024-01-09 07:11

from django.db import migrations


def init_document_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.document_type
    '''
    DocumentType = apps.get_model('registration', 'DocumentType')
    DocumentType.objects.bulk_create(
        [
            DocumentType(name='equipment_list'),
        ]
    )


def reverse_init_document_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.document_type
    '''
    DocumentType = apps.get_model('registration', 'DocumentType')
    DocumentType.objects.filter(
        name__in=[
            'equipment_list',
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('registration', '0041_remove_historicalmultipleoperator_mailing_address_and_more'),
    ]

    operations = [
        migrations.RunPython(init_document_type_data, reverse_init_document_type_data),
    ]
