from django.apps.registry import Apps
from django.db.backends.base.schema import BaseDatabaseSchemaEditor as SchemaEditor


def init_element_config_intersection_data(apps: Apps, schema_editor: SchemaEditor):
    '''
    Add initial configuration element field data
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ReportingField = apps.get_model('reporting', 'ReportingField')

    elementField = apps.get_model('reporting', 'configElementReportingField')
    elementField.objects.bulk_create(
        [
            # GSC-CO2-Default HHV/Default EF
            elementField(configuration_element=ConfigurationElement.objects.get(pk=1), reporting_field=ReportingField.objects.get(pk=1)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=2), reporting_field=ReportingField.objects.get(pk=1)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=3), reporting_field=ReportingField.objects.get(pk=1)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=4), reporting_field=ReportingField.objects.get(pk=1)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=1), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=2), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=3), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=4), reporting_field=ReportingField.objects.get(pk=2)),

            # GSC-CO2 - Default EF
            elementField(configuration_element=ConfigurationElement.objects.get(pk=13), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=14), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=15), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=16), reporting_field=ReportingField.objects.get(pk=2)),

            # GSC-CO2-Measured HHV/Default EF
            elementField(configuration_element=ConfigurationElement.objects.get(pk=25), reporting_field=ReportingField.objects.get(pk=3)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=26), reporting_field=ReportingField.objects.get(pk=3)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=27), reporting_field=ReportingField.objects.get(pk=3)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=28), reporting_field=ReportingField.objects.get(pk=3)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=25), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=26), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=27), reporting_field=ReportingField.objects.get(pk=2)),
            elementField(configuration_element=ConfigurationElement.objects.get(pk=28), reporting_field=ReportingField.objects.get(pk=2)),
        ]
    )
