# Generated by Django 5.0.8 on 2024-10-22 18:08

from django.db import migrations

# We have a couple left over activities that should not be in our dataset: Oil and gas extraction and gas processing activities & Carbon dioxide transportation and oil transmission
# These activities were split up and have been replaced by the following (which already exist in out data):
# Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities
# Non-compression and non-processing activities that are oil and gas extraction and gas processing activities
# Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities
# Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission
def remove_old_activity_records(apps, schema_monitor):
    '''
    Remove deprecated activity records
    '''

    Activity = apps.get_model('registration', 'Activity')
    Activity.objects.get(name='Oil and gas extraction and gas processing activities').delete()
    Activity.objects.get(name='Carbon dioxide transportation and oil transmission').delete()


def reverse_remove_old_activity_records(apps, schema_monitor):
    '''
    Undo Remove deprecated activity records
    '''

    Activity = apps.get_model('registration', 'Activity')
    Activity.objects.create(
        name='Oil and gas extraction and gas processing activities', applicable_to='lfo', weight=9999
    ),
    Activity.objets.create(name='Carbon dioxide transportation and oil transmission', applicable_to='lfo', weight=9999),


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0046_V1_12_0'),
    ]

    operations = [
        migrations.RunPython(remove_old_activity_records, reverse_remove_old_activity_records),
    ]
