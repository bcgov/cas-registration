# Generated by Django 5.0.7 on 2024-11-01 18:45

from django.db import migrations


def migrate_to_bc_greenhouse_gas_id_model(apps, schema_monitor):
    '''
    Create BcGreenhouseGasId records for each operation and facility that have a bcghg_id field (they will be migrated to a OneToOneField that references the BcGreenhouseGasId model in the next migration).

    '''
    Operation = apps.get_model('registration', 'Operation')
    BcGreenhouseGasId = apps.get_model('registration', 'BcGreenhouseGasId')

    # operation
    operations_with_bcghg_id = Operation.objects.filter(bcghg_id__isnull=False)
    for operation in operations_with_bcghg_id:
        BcGreenhouseGasId.objects.create(
            id=operation.bcghg_id,
        )

    # check counts
    if BcGreenhouseGasId.objects.count() != operations_with_bcghg_id.count():
        raise Exception('Migration unsuccessful')


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0051_bcgreenhousegasid_historicalbcgreenhousegasid'),
    ]

    operations = [migrations.RunPython(migrate_to_bc_greenhouse_gas_id_model)]