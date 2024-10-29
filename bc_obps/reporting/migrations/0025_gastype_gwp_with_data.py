# Generated by Django 5.0.8 on 2024-10-29 22:24

from django.db import migrations, models


def init_gas_type_gwp_values(apps, schema_monitor):
    '''
    Update erc.gas_type with gwp values
    '''

    GasType = apps.get_model('reporting', 'GasType')

    # CO2
    g = GasType.objects.get(chemical_formula='CO2')
    g.gwp = 1
    g.save()

    # CH4
    g = GasType.objects.get(chemical_formula='CH4')
    g.gwp = 28
    g.save()

    # N20
    g = GasType.objects.get(chemical_formula='N2O')
    g.gwp = 265
    g.save()

    # SF6
    g = GasType.objects.get(chemical_formula='SF6')
    g.gwp = 23500
    g.save()

    # CF4
    g = GasType.objects.get(chemical_formula='CF4')
    g.gwp = 6630
    g.save()

    # C2F6
    g = GasType.objects.get(chemical_formula='C2F6')
    g.gwp = 11000
    g.save()

    # CH2F2
    g = GasType.objects.get(chemical_formula='CH2F2')
    g.gwp = 677
    g.save()

    # C2HF5
    g = GasType.objects.get(chemical_formula='C2HF5')
    g.gwp = 3170
    g.save()

    # C2H2F4
    g = GasType.objects.get(chemical_formula='C2H2F4')
    g.gwp = 1300
    g.save()


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0024_open_pit_coal_mining'),
    ]

    operations = [
        migrations.AddField(
            model_name='gastype',
            name='gwp',
            field=models.IntegerField(
                db_comment='GWP is the Global Warming Potential of a specific gas. The GWP value is used to convert gases into a CO2 equivalent value. For example, if CH4 gas has a gwp of 28, then 1 tonne of CH4 is equivalent to 28 tonnes of CO2 (CO2e). Source: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/392_2008#section6',
                default=1,
            ),
            preserve_default=False,
        ),
        migrations.RunPython(init_gas_type_gwp_values),  # No revert function needed here
    ]
