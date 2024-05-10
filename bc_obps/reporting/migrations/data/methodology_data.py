from django.apps.registry import Apps
from django.db.backends.base.schema import BaseDatabaseSchemaEditor as SchemaEditor


def init_methodology_data(apps: Apps, schema_editor: SchemaEditor):
    '''
    Add initial methodologies
    '''
    ReportingMethodology = apps.get_model('reporting', 'ReportingMethodology')
    ReportingMethodology.objects.bulk_create(
        [
            ReportingMethodology(name='Default HHV/Default EF'),
            ReportingMethodology(name='Default EF'),
            ReportingMethodology(name='Measured HHV/Default EF'),
            ReportingMethodology(name='Measured Steam/Default EF'),
            ReportingMethodology(name='Measured CC'),
            ReportingMethodology(name='Measured Steam/Measured EF'),
            ReportingMethodology(name='Alternative Parameter Measurement'),
            ReportingMethodology(name='Replacement Methodology'),
            ReportingMethodology(name="Slope method"),
            ReportingMethodology(name='Overvoltage method'),
            ReportingMethodology(name='C2F6 anode effects'),
            ReportingMethodology(name='Inventory'),
            ReportingMethodology(name='Input/output'),
        ]
    )
