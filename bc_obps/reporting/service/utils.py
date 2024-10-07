from datetime import datetime

from reporting.models.configuration import Configuration


def exclude_keys(dict: dict, exclude_keys: list[str]) -> dict:
    return {key: dict[key] for key in dict if key not in exclude_keys}


def find_configuration(date: datetime) -> Configuration:
    return Configuration.objects.get(valid_from__lte=date, valid_to__gte=date)


def retrieve_ids(data: dict | list[dict]):
    """
    Utility function to retrieve the id field of each element of a list or dict
    """
    # Assumes a dict of dicts containing the ID
    if isinstance(data, dict):
        return [data[key].get("id") for key in data if data[key].get("id") is not None]

    # Assumes a list of dicts containing the ID
    return [element.get('id') for element in data if element.get("id") is not None]
