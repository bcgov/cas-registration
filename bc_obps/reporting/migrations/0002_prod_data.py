# Generated by Django 5.0.6 on 2024-06-21 21:03

from django.db import migrations


def init_source_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.sourcetype
    '''
    SourceType = apps.get_model('reporting', 'SourceType')
    SourceType.objects.bulk_create(
        [
            SourceType(name='General stationary combustion of fuel or waste with production of useful energy'),
            SourceType(name='General stationary combustion of waste without production of useful energy'),
            SourceType(name='Fuel combustion by mobile equipment that is part of the facility'),
            SourceType(
                name='Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination'
            ),
            SourceType(name='Anode effects'),
            SourceType(name='Cover gas from electrolysis cells'),
            SourceType(name='Steam reformation or gasification of a hydrocarbon during ammonia production'),
            SourceType(
                name='Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material'
            ),
            SourceType(name='Coal when broken or exposed to the atmosphere during mining'),
            SourceType(name='Stored coal piles'),
            SourceType(name='Removal of impurities using carbonate flux reagents'),
            SourceType(name='Use of reducing agents'),
            SourceType(
                name='Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes'
            ),
            SourceType(name='The solvent extraction and electrowinning process, also known as SX-EW'),
            SourceType(name='Fuel combustion for electricity generation'),
            SourceType(name='Acid gas scrubbers and acid gas reagents'),
            SourceType(name='Cooling units'),
            SourceType(name='Geothermal geyser steam or fluids'),
            SourceType(name='Installation, maintenance, operation and decommission-ing of electrical equipment'),
            SourceType(
                name='Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma'
            ),
            SourceType(
                name='Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production'
            ),
            SourceType(name='Calcination of carbonate materials'),
            SourceType(
                name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
            ),
            SourceType(name='Industrial wastewater process using anaerobic digestion'),
            SourceType(name='Oil-water separators'),
            SourceType(name='Use of reducing agents during lead production'),
            SourceType(name='Calcination of carbonate materials in lime manufacturing'),
            SourceType(name='Use of reducing agents in magnesium production'),
            SourceType(name='Cover gases or carrier gases in magnesium production'),
            SourceType(
                name='Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing'
            ),
            SourceType(name='Flares and oxidizers'),
            SourceType(name='Process vents'),
            SourceType(name='Equipment leaks'),
            SourceType(name='Ethylene production'),
            SourceType(name='Process units'),
            SourceType(name='Catalyst regeneration'),
            SourceType(name='Asphalt production'),
            SourceType(name='Sulphur recovery'),
            SourceType(
                name='Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases'
            ),
            SourceType(name='Above-ground storage tanks at refineries'),
            SourceType(name='Oil-water separators at refineries'),
            SourceType(name='Equipment leaks at refineries'),
            SourceType(name='Wastewater processing using anaerobic digestion at refineries'),
            SourceType(name='Uncontrolled blowdown systems used at refineries'),
            SourceType(name='Loading operations at refineries and terminals'),
            SourceType(name='Delayed coking units at refineries'),
            SourceType(name='Coke calcining at refineries'),
            SourceType(name='Reaction of calcium carbonate with sulphuric acid'),
            SourceType(name='Pulping and chemical recovery'),
            SourceType(name='Combustion of refinery fuel gas, still gas, flexigas or associated gas'),
            SourceType(name='Use of reducing agents during zinc production'),
            SourceType(name='Above-ground storage tanks'),
            SourceType(name='Carbonates used but not consumed in other activities set out in column 2'),
            SourceType(
                name='General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy'
            ),
            SourceType(
                name='General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy'
            ),
            SourceType(name='Field gas or process vent gas combustion at a linear facilities operation'),
            SourceType(name='Natural gas pneumatic high bleed device venting'),
            SourceType(name='Natural gas pneumatic pump venting'),
            SourceType(name='Natural gas pneumatic low bleed device venting'),
            SourceType(name='Natural gas pneumatic intermittent bleed device venting'),
            SourceType(name='Acid gas removal venting or incineration'),
            SourceType(name='Dehydrator venting'),
            SourceType(name='Blowdown venting'),
            SourceType(name='Releases from tanks used for storage, production or processing'),
            SourceType(name='Associated gas venting'),
            SourceType(name='Associated gas flaring'),
            SourceType(name='Flaring stacks'),
            SourceType(name='Centrifugal compressor venting'),
            SourceType(name='Reciprocating compressor venting'),
            SourceType(name='Equipment leaks detected using leak detection and leaker emission factor methods'),
            SourceType(name='Population count sources'),
            SourceType(name='Transmission storage tanks'),
            SourceType(name='Enhanced oil recovery injection pump blowdowns'),
            SourceType(name='Produced water dissolved carbon dioxide and methane'),
            SourceType(name='Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide'),
            SourceType(name='Other venting sources'),
            SourceType(name='Other fugitive sources'),
            SourceType(name='Third-party line hits with release of gas'),
            SourceType(name='Natural gas pneumatic high bleed device venting'),
            SourceType(name='Natural gas pneumatic pump venting'),
            SourceType(name='Dehydrator venting'),
            SourceType(name='Well venting for liquids unloading'),
            SourceType(
                name='Gas well venting during well completions and workovers with or without hydraulic fracturing'
            ),
            SourceType(name='Drilling flaring'),
            SourceType(name='Drilling venting'),
            SourceType(name='Hydraulic fracturing flaring'),
            SourceType(name='Well testing venting'),
            SourceType(name='Well testing flaring'),
            SourceType(name='Associated gas venting'),
            SourceType(name='Associated gas flaring'),
            SourceType(name='Centrifugal compressor venting'),
            SourceType(name='Reciprocating compressor venting'),
            SourceType(name='Equipment leaks detected using leak detection and leaker emission factor methods'),
            SourceType(name='Population count sources'),
            SourceType(name='Enhanced oil recovery injection pump blowdowns'),
            SourceType(name='Produced water dissolved carbon dioxide and methane'),
            SourceType(name='Enhanced oil recovery hydrocarbon liquids dissolved carbon dioxide'),
            SourceType(name='Other venting sources'),
            SourceType(name='Other fugitive sources'),
            SourceType(name='Third-party line hits with release of gas'),
            SourceType(name='Installation, maintenance, operation and decommissioning of electrical equipment'),
            SourceType(name='Flare stacks'),
            SourceType(name='Natural gas pneumatic low bleed device venting'),
            SourceType(name='Natural gas pneumatic intermittent bleed device venting'),
            SourceType(name='Blowdown venting'),
            SourceType(name='Transmission storage tanks'),
            SourceType(name='Natural gas pneumatic intermittent bleed device'),
            SourceType(name='Third party line hits with release of gas'),
        ]
    )


def reverse_init_source_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.reportingactivity
    '''
    SourceType = apps.get_model('reporting', 'SourceType')
    SourceType.objects.filter(
        name__in=[
            'General stationary combustion of fuel or waste with production of useful energy',
            'General stationary combustion of waste without production of useful energy',
            'Fuel combustion by mobile equipment that is part of the facility',
            'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
            'Anode effects',
            'Cover gas from electrolysis cells',
            'Steam reformation or gasification of a hydrocarbon during ammonia production',
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
            'Coal when broken or exposed to the atmosphere during mining',
            'Stored coal piles',
            'Removal of impurities using carbonate flux reagents',
            'Use of reducing agents',
            'Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes',
            'The solvent extraction and electrowinning process, also known as SX-EW',
            'Fuel combustion for electricity generation',
            'Acid gas scrubbers and acid gas reagents',
            'Cooling units',
            'Geothermal geyser steam or fluids',
            'Installation, maintenance, operation and decommission-ing of electrical equipment',
            'Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma/dry etching processes',
            'Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production',
            'Calcination of carbonate materials',
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
            'Industrial wastewater process using anaerobic digestion',
            'Oil-water separators',
            'Use of reducing agents during lead production',
            'Calcination of carbonate materials in lime manufacturing',
            'Use of reducing agents in magnesium production',
            'Cover gases or carrier gases in magnesium production',
            'Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing',
            'Flares and oxidizers',
            'Process vents',
            'Equipment leaks',
            'Ethylene production',
            'Process units',
            'Catalyst regeneration',
            'Asphalt production',
            'Sulphur recovery',
            'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
            'Above-ground storage tanks at refineries',
            'Oil-water separators at refineries',
            'Equipment leaks at refineries',
            'Wastewater processing using anaerobic digestion at refineries',
            'Uncontrolled blowdown systems used at refineries',
            'Loading operations at refineries and terminals',
            'Delayed coking units at refineries',
            'Coke calcining at refineries',
            'Reaction of calcium carbonate with sulphuric acid',
            'Pulping and chemical recovery',
            'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
            'Use of reducing agents during zinc production',
            'Above-ground storage tanks',
            'Carbonates used but not consumed in other activities set out in column 2',
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
            'Field gas or process vent gas combustion at a linear facilities operation',
            'Natural gas pneumatic high bleed device venting',
            'Natural gas pneumatic pump venting',
            'Natural gas pneumatic low bleed device venting',
            'Natural gas pneumatic intermittent bleed device venting',
            'Acid gas removal venting or incineration',
            'Dehydrator venting',
            'Blowdown venting',
            'Releases from tanks used for storage, production or processing',
            'Associated gas venting',
            'Associated gas flaring',
            'Flaring stacks',
            'Centrifugal compressor venting',
            'Reciprocating compressor venting',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'Population count sources',
            'Transmission storage tanks',
            'Enhanced oil recovery injection pump blowdowns',
            'Produced water dissolved carbon dioxide and methane',
            'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
            'Other venting sources',
            'Other fugitive sources',
            'Third-party line hits with release of gas',
            'Natural gas pneumatic high bleed device venting',
            'Natural gas pneumatic pump venting',
            'Dehydrator venting',
            'Well venting for liquids unloading',
            'Gas well venting during well completions and workovers with or without hydraulic fracturing',
            'Drilling flaring',
            'Drilling venting',
            'Hydraulic fracturing flaring',
            'Well testing venting',
            'Well testing flaring',
            'Associated gas venting',
            'Associated gas flaring',
            'Centrifugal compressor venting',
            'Reciprocating compressor venting',
            'Equipment leaks detected using leak detection and leaker emission factor methods',
            'Population count sources',
            'Enhanced oil recovery injection pump blowdowns',
            'Produced water dissolved carbon dioxide and methane',
            'Enhanced oil recovery hydrocarbon liquids dissolved carbon dioxide',
            'Other venting sources',
            'Other fugitive sources',
            'Third-party line hits with release of gas',
            'Installation, maintenance, operation and decommissioning of electrical equipment',
            'Flare stacks',
            'Natural gas pneumatic low bleed device venting',
            'Natural gas pneumatic intermittent bleed device venting',
            'Blowdown venting',
            'Transmission storage tanks',
            'Natural gas pneumatic intermittent bleed device',
            'Third party line hits with release of gas',
        ]
    ).delete()


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


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(init_source_type_data, reverse_init_source_type_data),
        migrations.RunPython(init_gas_type_data, reverse_init_gas_type_data),
        migrations.RunPython(init_methodology_data, reverse_init_methodology_data),
    ]
