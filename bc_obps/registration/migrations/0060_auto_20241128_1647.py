# Generated by Django 5.0.9 on 2024-11-28 16:47

from django.db import migrations


def irc_app_role_data(apps, schema_monitor):
    '''
    Add new IRC roles to erc.app_role
    '''
    # We get the model from the versioned app registry;
    # if we directly import it, it'll be the wrong version
    AppRole = apps.get_model('registration', 'AppRole')
    AppRole.objects.create(
        role_name='cas_director',
        role_description='Director user from the BC Government.',
    )


def reverse_irc_app_role_data(apps, schema_monitor):
    '''
    Remove data from erc.app_role
    '''
    AppRole = apps.get_model('registration', 'AppRole')
    AppRole.objects.filter(role_name='cas_director').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0059_V1_15_0'),
    ]

    operations = [migrations.RunPython(irc_app_role_data, reverse_irc_app_role_data)]
