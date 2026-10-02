import pytest
from model_bakery import baker

from registry.models import Issuance, Unit
from registry.schema.issuance import IssuanceFilterSchema
from service.issuance_service import IssuanceService

pytestmark = pytest.mark.django_db


def test_list_issuances_filters_and_loads_related_records():
    active_issuance = baker.make(Issuance, status=Issuance.IssuanceStatus.ACTIVE)
    draft_issuance = baker.make(Issuance, status=Issuance.IssuanceStatus.DRAFT)
    active_unit = baker.make(Unit, issuance=active_issuance)
    baker.make(Unit, issuance=draft_issuance)

    result = list(
        IssuanceService.list_issuances(
            "request_date",
            "asc",
            IssuanceFilterSchema(status=Issuance.IssuanceStatus.ACTIVE),
        )
    )

    assert [unit.id for unit in result] == [active_unit.id]
    assert result[0].issuance.account.name
    assert result[0].project.name
    assert result[0].issuance.project.operation.name
    assert result[0].issuance.verifier.name