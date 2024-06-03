from model_bakery import baker
from reporting.models.report import Report


def report_baker() -> Report:
    return baker.make(Report)
