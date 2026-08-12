from datetime import date
from decimal import Decimal


def set_regulated_name(apps, schema_editor):
    Activity = apps.get_model('registration', 'Activity')

    for activity in Activity.objects.all():
        activity.regulated_name = activity.name
        activity.save()


def update_activity_name(apps, schema_editor):
    Activity = apps.get_model('registration', 'Activity')

    Activity.objects.filter(slug='gsc_excluding_line_tracing').update(
        name='General stationary combustion excluding line tracing (at SFO)'
    )
    Activity.objects.filter(slug='gsc_solely_for_line_tracing').update(
        name='General stationary combustion (line tracing)'
    )
    Activity.objects.filter(slug='gsc_other_than_non_compression').update(
        name='General stationary combustion (compression and processing)'
    )
    Activity.objects.filter(slug='gsc_non_compression').update(
        name='General stationary combustion (other than compression and processing)'
    )
    Activity.objects.filter(slug='natural_gas_activities_other_than_non_compression').update(
        name='Natural gas transmission (compression and processing)'
    )
    Activity.objects.filter(slug='natural_gas_activities_non_compression').update(
        name='Natural gas transmission (other than compression and processing)'
    )
    Activity.objects.filter(slug='og_activities_other_than_non_compression').update(
        name='Oil & Gas extraction (compression and processing)'
    )
    Activity.objects.filter(slug='og_activities_non_compression').update(
        name='Oil & Gas extraction (other than compression and processing)'
    )


def add_product_and_pwaei(apps, schema_monitor):
    '''
    Add the new Pulp & Paper: Lime Revovery Kiln
    '''
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    ProductEmissionIntensity = apps.get_model('reporting', 'ProductEmissionIntensity')

    RegulatedProduct.objects.create(
        name="Pulp and paper: lime recovered by kiln",
        unit="Tonnes dry recovered lime (calcium oxide)",
        is_regulated=True,
        # Overwritten by populate_valid_dates below; valid_from/valid_to are NOT NULL.
        valid_from=date(2023, 1, 1),
        valid_to=date(2099, 12, 31),
    )
    ProductEmissionIntensity.objects.create(
        product_id=RegulatedProduct.objects.get(name="Pulp and paper: lime recovered by kiln").id,
        product_weighted_average_emission_intensity=Decimal("0.3822"),
        valid_from='2023-01-01',
        valid_to='9999-12-31',
    )


def reverse_add_product_and_pwaei(apps, schema_monitor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    ProductEmissionIntensity = apps.get_model('reporting', 'ProductEmissionIntensity')

    ProductEmissionIntensity.objects.filter(product__name="Pulp and paper: lime recovered by kiln").delete()
    RegulatedProduct.objects.filter(name="Pulp and paper: lime recovered by kiln").delete()


def update_lng_product_units(apps, schema_monitor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    lng_product = RegulatedProduct.objects.get(name='Liquefied natural gas')
    lng_product.unit = 'Tonne liquefied natural gas'
    lng_product.save()


def populate_valid_dates(apps, schema_editor):
    RegulatedProduct = apps.get_model('registration', 'RegulatedProduct')
    RegulatedProduct.objects.all().update(
        valid_from=date(2023, 1, 1),
        valid_to=date(2099, 12, 31),
    )
    RegulatedProduct.objects.filter(name='Pulp and paper: lime recovered by kiln').update(
        valid_from=date(2025, 1, 1),
    )
