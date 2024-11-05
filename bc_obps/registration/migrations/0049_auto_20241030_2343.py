# Generated by Django 5.0.9 on 2024-10-30 23:43

from django.db import migrations


def add_document_type_data(apps, schema_monitor):
    '''
    Add new_entrant_application to erc.document_type
    '''
    DocumentType = apps.get_model('registration', 'DocumentType')
    DocumentType.objects.create(name='new_entrant_application')


def reverse_add_document_type_data(apps, schema_monitor):
    '''
    Remove new_entrant_application from erc.document_type
    '''
    DocumentType = apps.get_model('registration', 'DocumentType')
    DocumentType.objects.filter(
        name='new_entrant_application',
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0048_bcobpsregulatedoperation_issued_by_and_more'),
    ]

    operations = [
        migrations.RunPython(add_document_type_data, reverse_add_document_type_data),
    ]