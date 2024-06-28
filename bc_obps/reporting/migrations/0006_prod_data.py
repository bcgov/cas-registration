# Generated by Django 5.0.6 on 2024-06-21 21:03

from django.db import migrations


def update_source_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.sourcetype
    '''
    SourceType = apps.get_model('reporting', 'SourceType')

    breakpoint()
    SourceType.objects.filter(name='Calcination of carbonate materials ').update(
        name='Calcination of carbonate materials'
    )
    SourceType.objects.filter(
        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock '
    ).update(
        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
    )


def reverse_source_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.reportingactivity
    '''
    SourceType = apps.get_model('reporting', 'SourceType')
    SourceType.objects.filter(name='Calcination of carbonate materials').update(
        name='Calcination of carbonate materials '
    )
    SourceType.objects.filter(
        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
    ).update(
        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock '
    )


def init_gas_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.gas_type
    '''
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.bulk_create(
        [
            GasType(name='Carbon Dioxide', chemical_formula='CO2'),
            GasType(name='Nitrous Oxide', chemical_formula='N2O'),
            GasType(name='Methane', chemical_formula='CH4'),
            GasType(name='Sulfur Hexafluoride', chemical_formula='SF6'),
            GasType(name='Tetrafluoromethane', chemical_formula='CF4'),
            GasType(name='Perfluoroethane', chemical_formula='C2F6'),
            GasType(name='Difluoromethane', chemical_formula='CH2F2'),
            GasType(name='Pentafluoroethane', chemical_formula='C2HF5'),
            GasType(name='1,1,1,2-Tetrafluoroethane', chemical_formula='C2H2F4'),
        ]
    )


def reverse_init_gas_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.gas_type
    '''
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.filter(
        chemical_formula__in=['CO2', 'N2O', 'CH4', 'SF6', 'CF4', 'C2F6', 'CH2F2', 'C2HF5', 'C2H2F4']
    ).delete()


def init_methodology_data(apps, schema_monitor):
    '''
    Add initial data to erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.bulk_create(
        [
            Methodology(name='Default HHV/Default EF'),
            Methodology(name='Default EF'),
            Methodology(name='Measured HHV/Default EF'),
            Methodology(name='Measured Steam/Default EF'),
            Methodology(name='Measured CC'),
            Methodology(name='Measured Steam/Measured EF'),
            Methodology(name='Alternative Parameter Measurement'),
            Methodology(name='Replacement Methodology'),
            Methodology(name='Anode Consumption'),
            Methodology(name='Slope method'),
            Methodology(name='Overvoltage method'),
            Methodology(name='C2F6 anode effects'),
            Methodology(name='Inventory'),
            Methodology(name='Input/output'),
        ]
    )


def reverse_init_methodology_data(apps, schema_monitor):
    '''
    Remove initial data from erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.filter(
        name__in=[
            'Default HHV/Default EF'
            'Default EF'
            'Measured HHV/Default EF'
            'Measured Steam/Default EF'
            'Measured CC'
            'Measured Steam/Measured EF'
            'Alternative Parameter Measurement'
            'Replacement Methodology'
            'Anode Consumption'
            'Slope method'
            'Overvoltage method'
            'C2F6 anode effects'
            'Inventory'
            'Input/output'
        ]
    ).delete()


def init_reporting_years_data(apps, schema_monitor):
    '''
    Add initial data to the reporting years table
    '''
    ReportingYear = apps.get_model('reporting', 'ReportingYear')
    ReportingYear.objects.bulk_create(
        [
            ReportingYear(
                reporting_year=2024,
                reporting_window_start="2025-01-01T00:00:00Z",
                reporting_window_end="2025-12-31T23:59:59Z",
                description="2024 reporting year",
            )
        ]
    )


def reverse_init_reporting_years_data(apps, schema_monitor):
    '''
    Remove initial data to the reporting years table
    '''
    ReportingYear = apps.get_model('reporting', 'ReportingYear')
    ReportingYear.objects.filter(reporting_year__in=[2024]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0005_reinit'),
    ]

    operations = [
        migrations.RunPython(update_source_type_data, reverse_source_type_data),
        migrations.RunPython(init_gas_type_data, reverse_init_gas_type_data),
        migrations.RunPython(init_methodology_data, reverse_init_methodology_data),
        migrations.RunPython(init_reporting_years_data, reverse_init_reporting_years_data),
    ]
