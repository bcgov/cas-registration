from django.apps.registry import Apps
from django.db.backends.base.schema import BaseDatabaseSchemaEditor as SchemaEditor


def init_config_field_data(apps: Apps, schema_editor: SchemaEditor):
    '''
    Add initial configuration element field data
    '''
    ConfigField = apps.get_model('reporting', 'ReportingField')
    ConfigField.objects.bulk_create(
        [
            ConfigField(field_name='fuelDefaultHighHeatingValue', field_type='number'),
            ConfigField(field_name='unitFuelCO2DefaultEmissionFactor', field_type='number'),
            ConfigField(field_name='fuelAnnualWeightedAverageHighHeatingValue', field_type='number'),
            ConfigField(field_name='unitFuelAnnualSteamGenerated', field_type='number'),
            ConfigField(field_name='boilerRatio', field_type='number'),
            ConfigField(field_name='unitFuelCO2EmissionFactor', field_type='number'),
            ConfigField(field_name='fuelAnnualWeightedAverageCarbonContent', field_type='number'),
            ConfigField(field_name='unitFuelCO2MeasuredEmissionFactor', field_type='number'),
            ConfigField(field_name='description', field_type='string'),
        ]
    )
