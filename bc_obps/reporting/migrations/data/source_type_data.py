from django.apps.registry import Apps
from django.db.backends.base.schema import BaseDatabaseSchemaEditor as SchemaEditor


def init_source_type_data(apps: Apps, schema_editor: SchemaEditor):
    '''
    Add initial source type list
    '''
    ReportingSourceType = apps.get_model('reporting', 'ReportingSourceType')
    ReportingSourceType.objects.bulk_create(
        [
            ReportingSourceType(name='General stationary combustion of fuel or waste with production of useful energy'),
            ReportingSourceType(name='General stationary combustion of waste without production of useful energy'),
            ReportingSourceType(name='Fuel combustion by mobile equipment that is part of the facility'),
            ReportingSourceType(
                name='Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination'
            ),
            ReportingSourceType(name='Anode effects'),
            ReportingSourceType(name='Cover gas from electrolysis cells'),
            ReportingSourceType(name='Steam reformation or gasification of a hydrocarbon during ammonia production '),
            ReportingSourceType(
                name='Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material '
            ),
            ReportingSourceType(name='Coal when broken or exposed to the atmosphere during mining '),
            ReportingSourceType(name='Stored coal piles '),
            ReportingSourceType(name='removal of impurities using carbonate flux reagents'),
            ReportingSourceType(name='use of reducing agents'),
            ReportingSourceType(
                name='use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes'
            ),
            ReportingSourceType(name='Fuel combustion for electricity generation'),
            ReportingSourceType(name='Acid gas scrubbers and acid gas reagents'),
            ReportingSourceType(name='Cooling units'),
            ReportingSourceType(name='Geothermal geyser steam or fluids'),
            ReportingSourceType(
                name='Installation, maintenance, operation and decommission-ing of electrical equipment'
            ),
        ]
    )
