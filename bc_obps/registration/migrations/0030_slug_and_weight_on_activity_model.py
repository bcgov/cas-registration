# Generated by Django 5.0.7 on 2024-08-12 22:20

from django.db import migrations, models


def init_activity_slug_weight(apps, schema_monitor):
    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='General stationary combustion excluding line tracing')
    r.slug = 'gsc_excluding_line_tracing'
    r.weight = 100.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Fuel combustion by mobile equipment')
    r.slug = 'fuel_combustion_by_mobile'
    r.weight = 500.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Aluminum or alumina production')
    r.slug = 'aluminum_production'
    r.weight = 600.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Ammonia production')
    r.slug = 'ammonia_production'
    r.weight = 700.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Cement production')
    r.slug = 'cement_production'
    r.weight = 800.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Underground coal mining')
    r.slug = 'underground_coal_mining'
    r.weight = 900.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Coal storage at facilities that combust coal')
    r.slug = 'coal_storage'
    r.weight = 1000.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Copper or nickel smelting or refining')
    r.slug = 'copper_nickel_refining'
    r.weight = 1100.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Electricity generation')
    r.slug = 'electricity_generation'
    r.weight = 1200.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Electronics manufacturing')
    r.slug = 'electronics_manufacturing'
    r.weight = 1300.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Ferroalloy production')
    r.slug = 'ferroalloy_production'
    r.weight = 1400.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Glass manufacturing')
    r.slug = 'glass_manufacturing'
    r.weight = 1500.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Hydrogen production')
    r.slug = 'hydrogen_production'
    r.weight = 1600.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Industrial wastewater processing')
    r.slug = 'ind_wastewater_processing'
    r.weight = 1700.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Lead production')
    r.slug = 'lead_production'
    r.weight = 1800.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Lime manufacturing')
    r.slug = 'lime_manufacturing'
    r.weight = 1900.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Magnesium production')
    r.slug = 'magnesium_production'
    r.weight = 2000.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Nitric acid manufacturing')
    r.slug = 'nitric_acid_manufacturing'
    r.weight = 2100.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Petrochemical production')
    r.slug = 'petrochemical_production'
    r.weight = 2200.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Petroleum refining')
    r.slug = 'petroleum_refining'
    r.weight = 2300.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Phosphoric acid production')
    r.slug = 'phos_acid_production'
    r.weight = 2400.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Pulp and paper production')
    r.slug = 'pulp_and_paper'
    r.weight = 2500.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Refinery fuel gas combustion')
    r.slug = 'refinery_fuel_gas'
    r.weight = 2600.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Zinc production')
    r.slug = 'zinc_production'
    r.weight = 2700.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Open pit coal mining')
    r.slug = 'open_pit_coal_mining'
    r.weight = 2800.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Storage of petroleum products')
    r.slug = 'storage_petro_products'
    r.weight = 2900.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Carbonate use')
    r.slug = 'carbonate_use'
    r.weight = 3000.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Oil and gas extraction and gas processing activities')
    r.slug = 'oil_gas_extraction'
    r.weight = 3100.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Carbon dioxide transportation and oil transmission')
    r.slug = 'co2_transportation'
    r.weight = 3200.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Electricity transmission')
    r.slug = 'electricity_transmission'
    r.weight = 3300.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Natural gas transmission')
    r.slug = 'natural_gas_transmission'
    r.weight = 3400.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Natural gas distribution')
    r.slug = 'natural_gas_distribution'
    r.weight = 3500.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='Natural gas storage')
    r.slug = 'natural_gas_storage'
    r.weight = 3600.0
    r.save()

    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    r = ReportingActivity.objects.get(name='LNG activities')
    r.slug = 'lng_activities'
    r.weight = 3700.0
    r.save()


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0029_rename_general_stationary_combustion'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalreportingactivity',
            name='slug',
            field=models.CharField(
                db_comment='A varchar slug to identify the activity on the frontend. This will be used to generate the routes to navigate to each activity',
                default='slug',
                max_length=50,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='historicalreportingactivity',
            name='weight',
            field=models.FloatField(
                db_comment='A weighted float value used to order activities. This will be used on the frontend to determine the order in which activity pages appear in an emissions report',
                default=100.0,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reportingactivity',
            name='slug',
            field=models.CharField(
                db_comment='A varchar slug to identify the activity on the frontend. This will be used to generate the routes to navigate to each activity',
                default='slug',
                max_length=50,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reportingactivity',
            name='weight',
            field=models.FloatField(
                db_comment='A weighted float value used to order activities. This will be used on the frontend to determine the order in which activity pages appear in an emissions report',
                default=100.0,
            ),
            preserve_default=False,
        ),
        migrations.RunPython(
            init_activity_slug_weight
        ),  # No reverse needed, function just overwrites the defaults above
    ]
