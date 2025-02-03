from abc import ABC, abstractmethod
from django.db.models import Count
from django.test import TestCase
from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import (
    ActivitySourceTypeJsonSchema,
)
from reporting.models.configuration import Configuration
from reporting.models.configuration_element import ConfigurationElement


class BaseProgramConfigurationTest(ABC, TestCase):
    activity_name = ""
    year = 0
    config = {}
    config_element_count = 0

    @classmethod
    @abstractmethod
    def setUpTestData(cls):
        """
        This function is to be implementated by the test.
        It needs to set:
          cls.activity_name : str
                         The name of the Activity model the test is for

          cls.year : int
                         The reporting year this config is for

          cls.config : dict
                         A dict containing the configuration to test, in the format
                         config = {
                            "Source Type Name 1" : {
                                "Gas Type Formula 1": {
                                    "Methodology 1": 2 # the number of reporting fields expected for that methodology
                                    "Methodology 2": 3
                                },
                                ...
                            }
                            ...
                         }

          cls.config_element_count : int
                         The number of configuration elements expected for this activity


        """
        pass

    def test_config_elements_are_setup(self):
        activity = Activity.objects.get(name=self.activity_name)
        config = Configuration.objects.get(slug=str(self.year))

        config_elements = ConfigurationElement.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        config = self.config

        self.assertQuerysetEqual(
            config_elements.values_list("source_type__name", flat=True).distinct(),
            config.keys(),
            ordered=False,
            msg=f"{activity} contains config for the proper source types",
        )

        for source_type_name, gas_config in config.items():
            self.assertQuerysetEqual(
                config_elements.filter(source_type__name=source_type_name)
                .values_list("gas_type__chemical_formula", flat=True)
                .distinct(),
                gas_config.keys(),
                ordered=False,
                msg=f"{source_type_name} contains config for the proper gas types",
            )
            for gas_name, methods in gas_config.items():
                self.assertQuerysetEqual(
                    config_elements.filter(
                        source_type__name=source_type_name,
                        gas_type__chemical_formula=gas_name,
                    )
                    .annotate(field_count=Count("reporting_fields"))
                    .values_list("methodology__name", "field_count"),
                    list(methods.items()),
                    ordered=False,
                    msg=f"{source_type_name}:{gas_name} contains config for the proper methods and field counts",
                )

        assert len(config_elements) == self.config_element_count
        assert len(config_elements) == sum(
            [len(config[source_type][gas]) for source_type in config.keys() for gas in config[source_type].keys()]
        )

    def test_activity_schemas_and_source_type_schemas_exist(self):
        activity = Activity.objects.get(name=self.activity_name)
        config = Configuration.objects.get(slug=str(self.year))

        activity_schemas = ActivityJsonSchema.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        assert len(activity_schemas) == 1

        source_type_schemas = ActivitySourceTypeJsonSchema.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        assert len(source_type_schemas) == len(self.config)
