from django.apps.registry import Apps
from django.db.backends.base.schema import BaseDatabaseSchemaEditor as SchemaEditor


def init_gas_type_data(apps: Apps, schema_editor: SchemaEditor):
    '''
    Add initial gas type data
    '''

    ReportingGasType = apps.get_model('reporting', 'ReportingGasType')
    ReportingGasType.objects.bulk_create(
        [
            ReportingGasType(name='carbon dioxide from non-biomass not listed in Schedule C.1'),
            ReportingGasType(name='carbon dioxide from non-biomass listed in Schedule C.1'),
            ReportingGasType(name='carbon dioxide from biomass listed in Schedule C'),
            ReportingGasType(name='carbon dioxide from biomass not listed in Schedule C'),
            ReportingGasType(name='methane from non-biomass not listed in Schedule C.1'),
            ReportingGasType(name='methane from non-biomass listed in Schedule C.'),
            ReportingGasType(name='methane from biomass listed in Schedule C'),
            ReportingGasType(name='methane from biomass not listed in Schedule C'),
            ReportingGasType(name='nitrous oxide from non-biomass not listed in Schedule C.1'),
            ReportingGasType(name='nitrous oxide from non-biomass listed in Schedule C.1'),
            ReportingGasType(name='nitrous oxide from biomass listed in Schedule C'),
            ReportingGasType(name='nitrous oxide from biomass not listed in Schedule C'),
            ReportingGasType(name='Carbon dioxide'),
            ReportingGasType(name='Methane'),
            ReportingGasType(name='Nitrous oxide'),
            ReportingGasType(name='Sulfur Hexafluoride'),
            ReportingGasType(name='Tetraluoromethane'),
            ReportingGasType(name='Perfluoroethane'),
            ReportingGasType(name='Difluoromethane'),
            ReportingGasType(name='Pentafluoroethane'),
            ReportingGasType(name='1,1,1,2-Tetrafluoroethane'),
        ]
    )
