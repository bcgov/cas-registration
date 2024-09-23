from datetime import datetime

from reporting.models.configuration import Configuration


def exclude_keys(dict: dict, exclude_keys: list[str]):
    return {key: dict[key] for key in dict if key not in exclude_keys}


def find_configuration(date: datetime):
    return Configuration.objects.get(valid_from__lte=date, valid_to__gte=date)
