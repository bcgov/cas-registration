import json
import uuid
from unittest.mock import MagicMock, patch
from django.core.cache import caches
from model_bakery.baker import prepare_recipe
import pytest
from registration.models.activity import Activity
from reporting.models import ActivityJsonSchema
from reporting.models.configuration import Configuration
from reporting.models.source_type import SourceType
from service.form_builder_service import (
    build_source_type_schema,
    handle_source_type_schema,
    build_schema,
    handle_gas_types,
)

pytestmark = pytest.mark.django_db


class TestHandleSourceTypeMethod:
    gas_type_enum = ["CAS", "GGIRCS"]
    gas_type_one_of = {"gas_type": "one_of"}

    def test_handle_source_type_schema_with_both_unit_and_fuel(self):
        json_schema = {
            "properties": {
                "units": {
                    "items": {
                        "properties": {
                            "fuels": {
                                "items": {
                                    "properties": {
                                        "fuelType": {"properties": {"fuelName": {"enum": []}}},
                                        "emissions": {
                                            "items": {
                                                "properties": {"gasType": {"enum": []}},
                                                "dependencies": {},
                                            },
                                        },
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=True,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            len(
                returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"][
                    "fuelType"
                ]["properties"]["fuelName"]["enum"]
            )
            > 0
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"][
                "items"
            ]["properties"]["gasType"]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"][
                "items"
            ]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_unit_and_no_fuel(self):
        json_schema = {
            "properties": {
                "units": {
                    "items": {
                        "properties": {
                            "emissions": {
                                "items": {
                                    "properties": {"gasType": {"enum": []}},
                                    "dependencies": {},
                                },
                            },
                        },
                    }
                }
            }
        }

        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=True,
            has_fuel=False,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["properties"][
                "gasType"
            ]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_fuel_and_no_unit(self):
        json_schema = {
            "properties": {
                "fuels": {
                    "items": {
                        "properties": {
                            "fuelType": {"properties": {"fuelName": {"enum": []}}},
                            "emissions": {
                                "items": {
                                    "properties": {"gasType": {"enum": []}},
                                    "dependencies": {},
                                },
                            },
                        }
                    }
                }
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=False,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            len(
                returned_schema["properties"]["fuels"]["items"]["properties"]["fuelType"]["properties"]["fuelName"][
                    "enum"
                ]
            )
            > 0
        )
        assert (
            returned_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["properties"][
                "gasType"
            ]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_no_fuel_nor_unit(self):
        json_schema = {
            "properties": {
                "emissions": {
                    "items": {
                        "properties": {"gasType": {"enum": []}},
                        "dependencies": {},
                    }
                },
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=False,
            has_fuel=False,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            returned_schema["properties"]["emissions"]["items"]["properties"]["gasType"]["enum"] == self.gas_type_enum
        )
        assert returned_schema["properties"]["emissions"]["items"]["dependencies"] == self.gas_type_one_of

    def _fuel_no_unit_schema(self, fuel_items_extra: dict | None = None) -> dict:
        fuel_items: dict = {
            "properties": {
                "fuelType": {"properties": {"fuelName": {"enum": []}}},
                "emissions": {
                    "items": {
                        "properties": {"gasType": {"enum": []}},
                        "dependencies": {},
                    },
                },
            }
        }
        if fuel_items_extra:
            fuel_items.update(fuel_items_extra)
        return {"properties": {"fuels": {"items": fuel_items}}}

    def _unit_and_fuel_schema(self, fuel_items_extra: dict | None = None) -> dict:
        fuel_items: dict = {
            "properties": {
                "fuelType": {"properties": {"fuelName": {"enum": []}}},
                "emissions": {
                    "items": {
                        "properties": {"gasType": {"enum": []}},
                        "dependencies": {},
                    },
                },
            }
        }
        if fuel_items_extra:
            fuel_items.update(fuel_items_extra)
        return {
            "properties": {
                "units": {"items": {"properties": {"fuels": {"items": fuel_items}}}},
            }
        }

    def test_required_preserves_existing_quarterly_fields_when_fuel_no_unit(self):
        """Required fields declared on the on-disk schema (e.g. quarterly amounts) must be preserved."""
        quarterly = ["q1FuelAmount", "q2FuelAmount", "q3FuelAmount", "q4FuelAmount"]
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=self._fuel_no_unit_schema({"required": list(quarterly)}),
            has_unit=False,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        required = set(returned_schema["properties"]["fuels"]["items"]["required"])
        assert required == {*quarterly}

    def test_required_preserves_existing_quarterly_fields_when_unit_and_fuel(self):
        """Required fields declared on the on-disk schema must be preserved (unit+fuel branch)."""
        quarterly = ["q1FuelAmount", "q2FuelAmount", "q3FuelAmount", "q4FuelAmount"]
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=self._unit_and_fuel_schema({"required": list(quarterly)}),
            has_unit=True,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        required = set(returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["required"])
        assert required == {*quarterly}

    def test_form_builder_uses_cache(self):
        mock_cache = MagicMock()
        caches["form_builder"] = mock_cache

        config_id = Configuration.objects.first().id
        activity_id = Activity.objects.first().id
        source_type_id = SourceType.objects.first().id

        # Nothing in cache, so the 'set' method is called
        mock_cache.get.return_value = None
        build_source_type_schema(config_id, activity_id, source_type_id, False)

        assert len(mock_cache.get.mock_calls) == 1
        mock_cache.get.assert_called_once_with(f"{config_id}-{activity_id}-{source_type_id}")
        assert len(mock_cache.set.mock_calls) == 1

        mock_cache.reset_mock()

        # Something in cache, so the 'set' method is not called
        # And we return the cached value
        mock_cache.get.return_value = "cached"
        return_value = build_source_type_schema(config_id, activity_id, source_type_id, False)
        assert return_value == "cached"
        assert len(mock_cache.get.mock_calls) == 1
        assert len(mock_cache.set.mock_calls) == 0

    def test_build_schema_fallback_no_activityjsonschema(self):
        mock_cache = MagicMock()
        caches["form_builder"] = mock_cache

        config_id = 1
        activity_id = 1
        source_types = []
        facility_id = str(uuid.uuid4())
        report_version_id = 1

        activity, _ = Activity.objects.update_or_create(id=activity_id, defaults={"name": "Test Activity"})

        ActivityJsonSchema.objects.filter(activity_id=activity_id).delete()

        mock_cache.get.return_value = None
        result = build_schema(config_id, activity_id, source_types, facility_id, report_version_id)
        result_schema = json.loads(result)

        # Assertions for fallback schema
        assert result_schema["schema"]["isFallbackSchema"] is True
        assert result_schema["schema"]["title"] == "Test Activity"
        assert "description" in result_schema["schema"]["properties"]
        assert result_schema["schema"]["properties"]["description"]["type"] == "string"
        assert result_schema["schema"]["properties"]["description"]["readOnly"] is True


class TestHandleGasTypes:
    """
    Tests for the handle_gas_types function, focused on the 'emission' property
    that is added to each gas type schema entry.
    """

    def _call_handle_gas_types(self, chemical_formula: str = "CO2") -> dict:
        """
        Helper that calls handle_gas_types with a single mocked gas type and
        returns the resulting gas_type_one_of dict.

        The internal ConfigurationElement DB query and handle_methodologies are
        both mocked so the tests focus purely on schema-building logic.
        """
        gas_type_id = 1

        # Represents the QuerySet item passed in as config_element_for_gas_types
        mock_config_elem = MagicMock()
        mock_config_elem.gas_type_id = gas_type_id
        mock_config_elem.gas_type.chemical_formula = chemical_formula

        # Represents a ConfigurationElement returned by the internal DB fetch;
        # gas_type_id must match so fetched_config_map is populated correctly.
        mock_fetched_elem = MagicMock()
        mock_fetched_elem.gas_type_id = gas_type_id

        gas_type_enum: list = []
        gas_type_one_of: dict = {"gasType": {"oneOf": []}}

        with (
            patch("service.form_builder_service.ConfigurationElement") as mock_ce,
            patch("service.form_builder_service.handle_methodologies"),
        ):
            mock_ce.objects.select_related.return_value.prefetch_related.return_value.filter.return_value = [
                mock_fetched_elem
            ]

            handle_gas_types(
                MagicMock(),  # source_type_schema (unused by the logic under test)
                gas_type_enum,
                gas_type_one_of,
                [mock_config_elem],
                activity_id=1,
                source_type_id=1,
                config_id=1,
                add_not_applicable_methodology=False,
            )

        return gas_type_one_of

    def test_handle_gas_types_adds_emission_property(self):
        """handle_gas_types should add an 'emission' key to the gas type schema."""
        gas_type_one_of = self._call_handle_gas_types()
        schema_properties = gas_type_one_of["gasType"]["oneOf"][0]["properties"]
        assert "emission" in schema_properties

    def test_handle_gas_types_emission_title_includes_chemical_formula(self):
        """The emission title should dynamically include the gas type chemical formula."""
        chemical_formula = "CO2"
        gas_type_one_of = self._call_handle_gas_types(chemical_formula)
        emission = gas_type_one_of["gasType"]["oneOf"][0]["properties"]["emission"]
        assert chemical_formula in emission["title"]

    def test_handle_gas_types_emission_type_is_number(self):
        """The emission property should declare type 'number'."""
        gas_type_one_of = self._call_handle_gas_types()
        emission = gas_type_one_of["gasType"]["oneOf"][0]["properties"]["emission"]
        assert emission["type"] == "number"

    def test_handle_gas_types_emission_minimum_is_zero(self):
        """The emission property should enforce a minimum value of 0."""
        gas_type_one_of = self._call_handle_gas_types()
        emission = gas_type_one_of["gasType"]["oneOf"][0]["properties"]["emission"]
        assert emission["minimum"] == 0
