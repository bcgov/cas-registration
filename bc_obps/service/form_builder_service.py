import json
from service.utils.get_report_valid_year_from_version_id import (
    get_report_valid_year_from_version_id,
)
from reporting.models import (
    Configuration,
    ConfigurationElement,
    ActivityJsonSchema,
    ActivitySourceTypeJsonSchema,
    CustomMethodologySchema,
)
from typing import Dict, List, Optional, Any
from django.db.models import QuerySet
from django.db.models import Prefetch
from service.data_access_service.fuel_service import FuelTypeDataAccessService


# Helper function to dynamically set the RJSF property value of a field from a Title cased name
def str_to_camel_case(st: str) -> str:
    output = "".join(x for x in st.title() if x.isalnum())
    return output[0].lower() + output[1:]


def get_custom_methodology_schema_by_id(schema_id: int) -> Dict[str, Any]:
    custom_schema = CustomMethodologySchema.objects.get(id=schema_id)
    return custom_schema.json_schema  # type: ignore[no-any-return]


def handle_methodologies(
    gas_type_id: int,
    activity_id: int,
    source_type_id: int,
    fetched_configuration_elements: List[ConfigurationElement],
    config_element_for_methodologies: List[ConfigurationElement],
    gas_type_one_of: Dict,
    index: int,
) -> None:
    methodology_enum: List[str] = []
    methodology_map: Dict[int, str] = {}
    methodology_one_of: Dict[str, Dict[str, List]] = {"methodology": {"oneOf": []}}

    # Create a mapping for quick lookup
    fetched_config_map = {
        (elem.gas_type.id, elem.methodology_id): list(elem.reporting_fields.all())
        for elem in fetched_configuration_elements
    }

    # Iterate through methodologies
    for config_element_for_methodology in config_element_for_methodologies:
        methodology_name = config_element_for_methodology.methodology.name
        methodology_id = config_element_for_methodology.methodology.id
        methodology_enum.append(methodology_name)
        methodology_map[methodology_id] = methodology_name

        # Use the precomputed map for quick access
        key = (gas_type_id, methodology_id)
        if key not in fetched_config_map:
            raise Exception(
                f"No configuration found for activity_id {activity_id} & source_type_id {source_type_id} "
                f"& gas_type_id {gas_type_id} & methodology_id {methodology_id}"
            )

        reporting_fields = fetched_config_map[key]

        # Create methodology object
        methodology_object: Dict[str, Dict] = {"properties": {"methodology": {"enum": [methodology_name]}}}

        # Check for custom schema
        if config_element_for_methodology.custom_methodology_schema_id:
            # Fetch and add custom schema
            custom_schema = get_custom_methodology_schema_by_id(
                config_element_for_methodology.custom_methodology_schema_id
            )
            methodology_object["properties"].update(custom_schema.get("properties", {}))

        else:
            for reporting_field in reporting_fields:
                property_field = str_to_camel_case(reporting_field.field_name)
                methodology_object["properties"][property_field] = {
                    "type": reporting_field.field_type,
                    "title": reporting_field.field_name,
                }
                if reporting_field.field_units:
                    methodology_object["properties"][f"{property_field}FieldUnits"] = {
                        "type": "string",
                        "default": reporting_field.field_units,
                        "title": f"{reporting_field.field_name} Units",
                        "readOnly": True,
                    }

        methodology_one_of["methodology"]["oneOf"].append(methodology_object)

    # Update gas_type_one_of with computed values
    gas_type_one_of["gasType"]["oneOf"][index]["properties"]["methodology"]["properties"]["methodology"][
        "enum"
    ] = methodology_enum
    gas_type_one_of["gasType"]["oneOf"][index]["properties"]["methodology"]["dependencies"] = methodology_one_of


def handle_gas_types(
    source_type_schema: ActivitySourceTypeJsonSchema,
    gas_type_enum: List,
    gas_type_one_of: Dict,
    config_element_for_gas_types: QuerySet[ConfigurationElement],
    activity_id: int,
    source_type_id: int,
    config_id: int,
) -> None:
    # Convert QuerySet to a list for efficient iteration without extra database hits
    config_elements_list = list(config_element_for_gas_types)

    # Use a dictionary to keep track of gas type's chemical_formula and cas_number
    gas_type_map: Dict[int, Dict[str, str]] = {
        ce.gas_type_id: {
            "chemical_formula": ce.gas_type.chemical_formula,
            "cas_number": ce.gas_type.cas_number,
        }
        for ce in config_elements_list
    }
    # Gather all necessary gas_type_ids for filtering fetched configurations
    gas_type_ids = list(gas_type_map.keys())

    # Fetch all relevant configuration elements with a single query
    fetched_configuration_elements = list(
        ConfigurationElement.objects.select_related("activity", "source_type", "gas_type", "methodology")
        .prefetch_related(Prefetch("reporting_fields", to_attr="prefetched_reporting_fields"))
        .filter(
            activity=activity_id,
            source_type=source_type_id,
            gas_type__id__in=gas_type_ids,
            valid_from__lte=config_id,
            valid_to__gte=config_id,
        )
    )

    # Organize fetched configuration elements by gas_type_id
    fetched_config_map: Dict[int, List[ConfigurationElement]] = {}
    for elem in fetched_configuration_elements:
        gas_type_id = elem.gas_type_id
        if gas_type_id not in fetched_config_map:
            fetched_config_map[gas_type_id] = []
        fetched_config_map[gas_type_id].append(elem)

    # Process each gas type element
    for index, config_element_for_gas_type in enumerate(config_elements_list):
        gas_type_id = config_element_for_gas_type.gas_type_id
        gas_type_info = gas_type_map.get(gas_type_id, {})
        gas_type_chemical_formula = gas_type_info.get("chemical_formula", "")
        gas_type_cas_number = gas_type_info.get("cas_number", "")

        # Add the gas type to the enum list
        gas_type_enum.append(gas_type_chemical_formula)

        # Retrieve methodologies associated with the current gas type
        config_element_for_methodologies = fetched_config_map.get(gas_type_id, [])

        if not config_element_for_methodologies:
            raise Exception(
                f"No configuration found for activity_id {activity_id} & source_type_id {source_type_id} "
                f"& gas_type_id {gas_type_id} & configuration {config_id}"
            )

        # Define the gas type schema
        gas_type_schema = {
            "properties": {
                "gasType": {"enum": [gas_type_chemical_formula]},
                "methodology": {
                    "type": "object",
                    "properties": {
                        "methodology": {
                            "title": "Methodology",
                            "type": "string",
                            "enum": [],
                        }
                    },
                },
            }
        }

        # Conditionally add CAS Number if it exists in the schema
        if (
            "properties" in source_type_schema.json_schema
            and "emissions" in source_type_schema.json_schema["properties"]
        ):
            emissions_properties = source_type_schema.json_schema["properties"]["emissions"]["items"]["properties"]

            if "casNumber" in emissions_properties:
                # If 'casNumber' is present, add it to the schema
                gas_type_schema["properties"]["casNumber"] = {
                    "type": "string",
                    "title": "CAS Registry Number",
                    "default": gas_type_cas_number,
                    "readOnly": True,
                }

        # Append the gas type schema to the oneOf branch
        gas_type_one_of["gasType"]["oneOf"].append(gas_type_schema)

        # Handle methodologies for the current gas type
        handle_methodologies(
            gas_type_id,
            activity_id,
            source_type_id,
            fetched_configuration_elements,
            config_element_for_methodologies,
            gas_type_one_of,
            index,
        )


def handle_source_type_schema(
    source_type_schema: ActivitySourceTypeJsonSchema,
    gas_type_enum: List,
    gas_type_one_of: Dict,
) -> Dict:
    st_schema: Dict = source_type_schema.json_schema
    # Append valid gas types to schema as an enum on the gasType property. Uses the has_unit / has_fuel booleans to determine the depth of the emissions array.
    if source_type_schema.has_unit and source_type_schema.has_fuel:
        # Fetch the list of fuels & add them to the fuelName enum
        fuel_list = list(FuelTypeDataAccessService.get_fuels().values_list("name", flat=True))
        st_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["fuelType"][
            "properties"
        ]["fuelName"]["enum"] = fuel_list
        st_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"]["items"][
            "properties"
        ]["gasType"]["enum"] = gas_type_enum
        st_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"]["items"][
            "dependencies"
        ] = gas_type_one_of
    elif source_type_schema.has_unit and not source_type_schema.has_fuel:
        st_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["properties"]["gasType"][
            "enum"
        ] = gas_type_enum
        st_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["dependencies"] = gas_type_one_of
    elif not source_type_schema.has_unit and source_type_schema.has_fuel:
        fuel_list = list(FuelTypeDataAccessService.get_fuels().values_list("name", flat=True))
        st_schema["properties"]["fuels"]["items"]["properties"]["fuelType"]["properties"]["fuelName"][
            "enum"
        ] = fuel_list
        st_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["properties"]["gasType"][
            "enum"
        ] = gas_type_enum
        st_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["dependencies"] = gas_type_one_of
    else:
        st_schema["properties"]["emissions"]["items"]["properties"]["gasType"]["enum"] = gas_type_enum
        st_schema["properties"]["emissions"]["items"]["dependencies"] = gas_type_one_of
    return st_schema


# Called by build_schema. Builds the source type schema including gas_type & methodology dependencies
def build_source_type_schema(
    config_id: int,
    activity_id: int,
    source_type_id: int,
) -> Dict:
    try:
        source_type_schema = ActivitySourceTypeJsonSchema.objects.get(
            activity_id=activity_id,
            source_type_id=source_type_id,
            valid_from__lte=config_id,
            valid_to__gte=config_id,
        )
    except Exception:
        raise Exception(
            f"No schema found for activity_id {activity_id} & source_type_id {source_type_id} & configuration {config_id}"
        )

    # Fetch valid gas_type values for activity-sourceType pair
    config_element_for_gas_types = (
        ConfigurationElement.objects.select_related("gas_type")
        .filter(
            activity_id=activity_id,
            source_type_id=source_type_id,
            valid_from__lte=config_id,
            valid_to__gte=config_id,
        )
        .distinct("gas_type__name")
    )
    gas_type_enum: List = []
    # Maps of the gas_type & methodology objects will be passed in the return object so we have the IDs on the frontend.
    gas_type_one_of: Dict = {"gasType": {"oneOf": []}}
    handle_gas_types(
        source_type_schema,
        gas_type_enum,
        gas_type_one_of,
        config_element_for_gas_types,
        activity_id,
        source_type_id,
        config_id,
    )
    return handle_source_type_schema(source_type_schema, gas_type_enum, gas_type_one_of)


# build_schema will dynamically create a form depending on the parameters passed
# activity: Returns a form with just the activity schema + the set of related source_types
# activity + source_type(s): Returns the activity schema, plus the schema(s) for each source type id passed in the List, plus fills the gas_type enum with the valid gas types based on the activity & source type
# activity + source_type(s) + gas_type selection is made: Returns all of the above, plus fills out the methodology enum with the valid methodology options based on the activity, source_type & gas_type selected
# activity + source_type(s) + gas_type selection + methodology selection is made: Returns all of the above, plus the additional reporting fields associated to the methodology selection
# report_date is mandatory & determines the valid schemas & WCI configuration for the point in time that the report was created


def build_schema(config_id: int, activity: int, source_types: List[str] | List[int]) -> str:
    # Get activity schema
    activity_schema = ActivityJsonSchema.objects.only("json_schema").get(
        activity_id=activity, valid_from__lte=config_id, valid_to__gte=config_id
    )

    rjsf_schema: Dict = activity_schema.json_schema

    # Fetch valid config elements for the activity
    valid_config_elements = (
        ConfigurationElement.objects.select_related("source_type")
        .filter(activity_id=activity, valid_from__lte=config_id, valid_to__gte=config_id)
        .order_by("source_type__id")
        .distinct("source_type__id")
    )

    # Except if no valid config elements are found
    if not valid_config_elements:
        raise Exception(f"No valid source_types found for activity_id {activity} & configuration {config_id}")
    # If only one config element is found, the source type is mandatory & should be added to the schema
    elif valid_config_elements.count() == 1:
        first_valid_config_elements: Optional[ConfigurationElement] = valid_config_elements.first()
        if first_valid_config_elements:
            rjsf_schema["properties"]["sourceTypes"] = {
                "type": "object",
                "title": "Source Types",
                "properties": {},
            }
            rjsf_schema["properties"]["sourceTypes"]["properties"][
                first_valid_config_elements.source_type.json_key
            ] = build_source_type_schema(config_id, activity, first_valid_config_elements.source_type_id)

    # If there are multiple config elements for an activity, the user may choose which ones apply. The IDs of the selected source_types are passed as a list in the parameters & we add those schemas to the activity schema.
    else:
        for config_element in valid_config_elements:
            rjsf_schema["properties"][config_element.source_type.json_key] = {
                "type": "boolean",
                "title": config_element.source_type.name,
            }

    # If no source_types are passed & there are more than 1 valid source type, only return the activity schema
    if not source_types and valid_config_elements.count() > 1:
        return json.dumps({"schema": rjsf_schema})

    if valid_config_elements.count() > 1:
        # Create the Source Types object (within which all the selected source_type schemas will be defined)
        rjsf_schema["properties"]["sourceTypes"] = {
            "type": "object",
            "title": "Source Types",
            "properties": {},
        }
        # For each selected source_type, add the related schema
        for source_type in source_types:
            valid_config_element = valid_config_elements.get(source_type__id=source_type)
            rjsf_schema["properties"]["sourceTypes"]["properties"][
                valid_config_element.source_type.json_key
            ] = build_source_type_schema(config_id, activity, valid_config_element.source_type_id)

    return json.dumps({"schema": rjsf_schema})


class FormBuilderService:
    @classmethod
    def build_form_schema(cls, activity: int, report_version_id: int, source_types: List[str] | List[int]) -> str:
        """
        Generates a form schema based on the provided activity, report version, and source types.

        Args:
            activity (int): The ID of the activity for which the form schema is being generated.
            report_version_id (int): The ID of the report version to determine the valid reporting period.
            source_types (List[str] | List[int]): A list of source types, which can be either strings or integers,
                                                  that are used to customize the form schema.

        Returns:
            str: A string representation of the generated form schema.

        Description:
            - First, it verifies that the `activity` parameter is valid. If `activity` is None, it raises an exception.
            - Then, it determines the report date by using `get_report_valid_year_from_version_id()`,
              which extracts the valid reporting year based on the report version.
            - It retrieves a `Configuration` object that matches the report date by checking if the date
              falls between the `valid_from` and `valid_to` fields.
            - Finally, the schema is built by calling `build_schema()`, passing the configuration ID,
              activity, source types, and the report date.
        """
        if activity is None:
            raise Exception("Cannot build a schema without Activity data")

        report_date = get_report_valid_year_from_version_id(report_version_id)
        # Get config objects
        config = Configuration.objects.only("id").get(valid_from__lte=report_date, valid_to__gte=report_date)
        schema = build_schema(config.id, activity, source_types)
        return schema
